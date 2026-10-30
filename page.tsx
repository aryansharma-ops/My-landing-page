import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { adminStatus } from "@/lib/admin-auth";
import { logoutAction } from "./actions";
import AdminLogin from "./AdminLogin";
import { Download, LogOut, Settings2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Insights dashboard", robots: { index: false } };

type CountRow = { label: string; value: number };

async function getMetrics() {
  const empty = {
    eventTotals: [] as CountRow[],
    countries: [] as CountRow[],
    categories: [] as CountRow[],
    products: [] as { slug: string; views: number; clicks: number; interests: number }[],
    sessions: 0,
    subscriptions: [] as CountRow[],
    surveyStarted: 0,
    surveySubmitted: 0,
    signups: 0,
    purchases: 0,
  };
  try {
    const since = sql`now() - interval '30 days'`;
    const [totals, countries, categories, products, sessions, subs, survey, signups, purchases] = await Promise.all([
      db.execute(sql`select name as label, count(*)::int as value from analytics_events where created_at > ${since} group by name order by value desc`),
      db.execute(sql`select coalesce(nullif(country,''),'unknown') as label, count(distinct session_id)::int as value from analytics_events where name='page_view' and created_at > ${since} group by 1 order by value desc limit 12`),
      db.execute(sql`select params->>'category' as label, count(*)::int as value from analytics_events where name in ('category_viewed') and params ? 'category' and created_at > ${since} group by 1 order by value desc`),
      db.execute(sql`
        select coalesce(params->>'slug','(unknown)') as slug,
          count(*) filter (where name='product_viewed')::int as views,
          count(*) filter (where name='purchase_cta_clicked')::int as clicks,
          count(*) filter (where name='notify_interest')::int as interests
        from analytics_events
        where name in ('product_viewed','purchase_cta_clicked','notify_interest') and created_at > ${since}
        group by 1 order by views desc`),
      db.execute(sql`select count(distinct session_id)::int as n from analytics_events where name='page_view' and created_at > ${since}`),
      db.execute(sql`select source || ' · ' || status as label, count(*)::int as value from subscriptions group by 1 order by value desc`),
      db.execute(sql`select
          count(*) filter (where name='survey_started')::int as started,
          count(*) filter (where name='survey_submitted')::int as submitted
        from analytics_events where created_at > ${since}`),
      db.execute(sql`select count(*)::int as n from analytics_events where name='newsletter_signup' and created_at > ${since}`),
      db.execute(sql`select count(*)::int as n from analytics_events where name='purchase_confirmed'`),
    ]);

    const r = <T,>(res: unknown): T[] => (res as { rows: T[] }).rows ?? [];
    const sessionsN = r<{ n: number }>(sessions)[0]?.n ?? 0;
    const surveyRow = r<{ started: number; submitted: number }>(survey)[0] ?? { started: 0, submitted: 0 };
    return {
      eventTotals: r<CountRow>(totals),
      countries: r<CountRow>(countries),
      categories: r<CountRow>(categories),
      products: r<{ slug: string; views: number; clicks: number; interests: number }>(products),
      sessions: sessionsN,
      subscriptions: r<CountRow>(subs),
      surveyStarted: surveyRow.started,
      surveySubmitted: surveyRow.submitted,
      signups: r<{ n: number }>(signups)[0]?.n ?? 0,
      purchases: r<{ n: number }>(purchases)[0]?.n ?? 0,
    };
  } catch {
    return { ...empty, dbError: true } as typeof empty & { dbError: boolean };
  }
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-charcoal/10 bg-white p-5">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-grey-mute">{label}</p>
      <p className="mt-2 font-serif text-[30px] text-charcoal">{value}</p>
      {hint && <p className="mt-1 text-[11.5px] leading-snug text-grey-mute">{hint}</p>}
    </div>
  );
}

function MiniTable({ title, rows, empty }: { title: string; rows: CountRow[]; empty: string }) {
  return (
    <div className="border border-charcoal/10 bg-white">
      <p className="border-b border-charcoal/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-grey-mute">{empty}</p>
      ) : (
        <ul className="divide-y divide-charcoal/8">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between px-5 py-2.5 text-[13px]">
              <span className="capitalize text-charcoal/80">{r.label.replaceAll("_", " ")}</span>
              <span className="font-semibold text-charcoal">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminPage() {
  const status = await adminStatus();

  if (status === "unconfigured") {
    return (
      <div className="mx-auto max-w-xl px-5 pb-24 pt-32">
        <div className="border-l-2 border-gold bg-white p-8">
          <h1 className="font-serif text-[26px] text-charcoal">Dashboard not activated yet</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-grey-mute">
            Set an <code className="bg-ivory px-1 py-0.5 text-[12.5px]">ADMIN_TOKEN</code> environment
            variable (at least 8 characters), restart the app, and return here. No data leaves this
            dashboard — it reads only your own database.
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="mx-auto max-w-xl px-5 pb-24 pt-32">
        <AdminLogin />
      </div>
    );
  }

  const m = await getMetrics();
  const signupRate = m.sessions > 0 ? ((m.signups / m.sessions) * 100).toFixed(1) + "%" : "—";
  const surveyRate = m.surveyStarted > 0 ? ((m.surveySubmitted / m.surveyStarted) * 100).toFixed(1) + "%" : "—";
  const ctr =
    m.products.reduce((a, p) => a + p.views, 0) > 0
      ? (
          (m.products.reduce((a, p) => a + p.clicks, 0) / m.products.reduce((a, p) => a + p.views, 0)) *
          100
        ).toFixed(1) + "%"
      : "—";

  const integrations = [
    { label: "Database (products, surveys, subscriptions, events)", ok: !("dbError" in m) },
    { label: "Google Analytics 4", ok: Boolean(process.env.NEXT_PUBLIC_GA_ID), setup: "Set NEXT_PUBLIC_GA_ID" },
    { label: "Email delivery (Resend)", ok: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), setup: "Set RESEND_API_KEY + EMAIL_FROM" },
    { label: "Contact email in footer", ok: Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL), setup: "Set NEXT_PUBLIC_CONTACT_EMAIL" },
    { label: "Confirmed purchases (Gumroad webhook)", ok: false, setup: "Point Gumroad Ping to /api/webhooks/gumroad (see SETUP.md)" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-gold">
            <TrendingUp className="size-4" aria-hidden /> Last 30 days · first-party data only
          </p>
          <h1 className="mt-3 font-serif text-[34px] text-charcoal">Insights dashboard</h1>
          <p className="mt-1 text-[13px] text-grey-mute">
            Everything shown here is computed live from your own database. Nothing is simulated; an
            empty metric means no data yet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export?type=survey"
            className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-charcoal hover:border-navy hover:text-navy"
          >
            <Download className="size-3.5" aria-hidden /> Survey CSV
          </a>
          <a
            href="/api/admin/export?type=subscriptions"
            className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-charcoal hover:border-navy hover:text-navy"
          >
            <Download className="size-3.5" aria-hidden /> Subscribers CSV
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-navy px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-charcoal"
            >
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Unique sessions" value={String(m.sessions)} hint="Distinct anonymous session IDs with a page view" />
        <Stat label="Email sign-up rate" value={signupRate} hint={`${m.signups} newsletter joins / sessions`} />
        <Stat label="Survey completion" value={surveyRate} hint={`${m.surveySubmitted} completed of ${m.surveyStarted} started`} />
        <Stat label="Product click-through" value={ctr} hint="CTA clicks ÷ product page views" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Confirmed purchases"
          value={String(m.purchases)}
          hint="Counts only provider-confirmed sales. Connect the checkout webhook to activate."
        />
        <Stat label="Revenue" value="—" hint="Reported per product & campaign once the checkout provider webhook is connected." />
        <Stat label="Survey events" value={String(m.eventTotals.find((e) => e.label === "survey_submitted")?.value ?? 0)} hint="Completed research submissions (30d)" />
        <Stat label="Guide requests" value={String(m.eventTotals.find((e) => e.label === "guide_requested")?.value ?? 0)} hint="Free-guide downloads requested (30d)" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <MiniTable title="Visitors by country" rows={m.countries} empty="No page-view data yet — visits appear here automatically." />
        <MiniTable title="Interest by category" rows={m.categories} empty="No category views recorded yet." />
        <MiniTable title="Subscriptions (source · status)" rows={m.subscriptions} empty="No subscribers yet — share the reading list." />
      </div>

      <div className="mt-4 border border-charcoal/10 bg-white">
        <p className="border-b border-charcoal/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy">
          Product interest (views / CTA clicks / notify-me)
        </p>
        {m.products.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-grey-mute">No product interactions yet.</p>
        ) : (
          <ul className="divide-y divide-charcoal/8">
            {m.products.map((p) => (
              <li key={p.slug} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2.5 text-[13px]">
                <span className="truncate text-charcoal/85">{p.slug}</span>
                <span className="text-charcoal/70">{p.views} views</span>
                <span className="text-charcoal/70">{p.clicks} clicks</span>
                <span className="font-semibold text-navy">{p.interests} notify</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 border border-charcoal/10 bg-white">
        <p className="flex items-center gap-2 border-b border-charcoal/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy">
          <Settings2 className="size-4" aria-hidden /> Integration status
        </p>
        <ul className="divide-y divide-charcoal/8">
          {integrations.map((i) => (
            <li key={i.label} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[13px]">
              <span className="text-charcoal/85">{i.label}</span>
              {i.ok ? (
                <span className="border border-navy/25 bg-navy/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy">
                  Connected
                </span>
              ) : (
                <span className="text-[12px] text-grey-mute">{i.setup}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="px-5 py-4 text-[12.5px] text-grey-mute">
          Full activation steps live in <code className="bg-ivory px-1 py-0.5">SETUP.md</code>.{" "}
          <Link href="/" className="text-navy underline-offset-4 hover:underline">
            Return to site →
          </Link>
        </p>
      </div>
    </div>
  );
}
