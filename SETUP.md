# Meridian Press — Setup & Integration Guide

This site is fully functional out of the box: the catalogue renders from the database,
the research survey, guide delivery, and reading list all persist real records, and the
operator dashboard (`/admin`) reads live first-party analytics. External services are
connected by setting environment variables — no code changes required.

## 1. Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (used by Drizzle). | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL, e.g. `https://meridianpress.com`. Used for sitemap, metadata, and email links. | Yes (prod) |
| `ADMIN_TOKEN` | Password for `/admin` and the CSV exports. Min. 8 characters. | Yes (prod) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID (`G-XXXXXXX`). When set, the gtag snippet loads (with IP anonymisation) and every `trackEvent` mirrors to GA4. When unset, **no** GA requests are made. | Optional |
| `RESEND_API_KEY` + `EMAIL_FROM` | Transactional email via [Resend](https://resend.com) — double opt-in confirmations and guide delivery. Without it, sign-ups are stored as `pending` and the UI tells users email delivery is inactive. | Optional |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer contact block when set. | Optional |
| `GUMROAD_SELLER_ID` | Verifies Gumroad Ping webhooks for confirmed purchases. | Optional |

Set these in your hosting platform's environment settings (never commit them).

## 2. Database

```bash
npx drizzle-kit push          # create tables from src/db/schema.ts
psql $DATABASE_URL -f scripts/seed.sql   # seed the 5 working-concept titles
node scripts/generate-guide.mjs          # regenerate the free PDF guide
```

## 3. Selling a book (Gumroad — digital)

1. Create the product at [gumroad.com](https://gumroad.com) (title, price, files, receipt).
2. Update the product row in the database:

```sql
update products
set status = 'available',
    price_cents = 1499,          -- always USD cents unless you set currency
    gumroad_url = 'https://meridianpress.gumroad.com/l/your-product',
    sample_url  = 'https://…sample.pdf'   -- optional free sample
where slug = 'the-psychology-of-power';
```

The purchase button, price, and structured-data offer appear automatically.
Cards are handled entirely by Gumroad; this site never touches payment data.
A click is tracked as `purchase_cta_clicked` + `checkout_initiated` — **never** as a sale.

### Confirmed purchases (webhook)
1. Gumroad → *Settings → Advanced → Ping URL* → `https://YOUR_DOMAIN/api/webhooks/gumroad`
2. Set `GUMROAD_SELLER_ID` (Gumroad → Settings → Profile).
3. Sales write `purchase_confirmed` and refunds write `refund_recorded` to
   `analytics_events` (visible in `/admin`). Buyer PII in the ping is discarded.
   Reconcile money in Gumroad — the dashboard counts events, not payments.

## 4. Selling print (Amazon)

Paste regional listings into `amazon_us / amazon_uk / amazon_ca / amazon_de / amazon_fr /
amazon_au`. The book page renders a "choose your region" list automatically, so each
visitor picks the marketplace that serves them.

### India / UPI (optional, India-only)
Add a payment link from an Indian provider (e.g. Razorpay Payment Pages supporting
Google Pay / PhonePe / Paytm) to `upi_pay_url`. It renders as a clearly-labelled
INR block on the book page — separate from international checkout, as required.

## 5. Email flows

- **Newsletter** = double opt-in. Sign-up creates a `pending` row and sends a
  confirmation link (`/confirm?token=…`). Only `confirmed` + `marketing_consent`
  rows should receive campaigns.
- **Guide** = fulfilment email with the PDF link; marketing consent is a separate,
  unchecked-by-default checkbox.
- **Survey** = never subscribes anyone automatically; only an explicit ticked box
  creates a `survey`-source subscription.
- Every email includes `/unsubscribe?token=…` (one click, no login).
- Export the list: `/admin → Subscribers CSV` (filter `status = confirmed` before
  importing into an ESP).

## 6. Analytics

First-party events land in `analytics_events` (no PII; params are key-whitelisted).
Consistent names: `page_view`, `category_viewed`, `product_viewed`,
`purchase_cta_clicked`, `checkout_initiated`, `purchase_confirmed`,
`refund_recorded`, `survey_started`, `survey_submitted`, `newsletter_signup`,
`guide_requested`, `notify_interest`.

UTM parameters are captured on first touch and attached to every event, e.g.
`?utm_source=youtube&utm_medium=video&utm_campaign=psychology_book`.
The `/admin` dashboard shows: visitors by country, category interest, email
sign-up rate, survey completion rate, product CTR, confirmed purchases, and
integration status. GA4 sees the same events once `NEXT_PUBLIC_GA_ID` is set.
Where your jurisdiction requires analytics consent, enable GA only after your
consent banner grants it.

## 7. Internationalisation (ready, not yet enabled)

All public copy lives in components under a single locale; pricing defaults to USD
with explicit currency labels. To add German/French: introduce a `[locale]` segment
(or `next-intl`), move copy into dictionaries, and add `hreflang` alternates in
`layout.tsx` metadata. Category and product data are language-agnostic already.

## 8. Going-live checklist for business details

- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` → real support inbox (footer activates)
- [ ] Fictional-safe organisation details verified in `layout.tsx` JSON-LD
- [ ] Social profiles → add links in `Footer.tsx` when they exist
- [ ] Refund policy: replace the stated intent in `app/refunds/page.tsx` with the final policy on launch day
