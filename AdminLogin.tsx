"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="mx-auto w-full max-w-sm border border-charcoal/10 bg-white p-8">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-gold">
        <KeyRound className="size-4" aria-hidden /> Operator access
      </p>
      <h1 className="mt-3 font-serif text-[26px] text-charcoal">Insights dashboard</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-grey-mute">
        Enter the operator token defined as <code className="bg-ivory px-1 py-0.5 text-[12px]">ADMIN_TOKEN</code> in your
        environment.
      </p>
      <label htmlFor="token" className="sr-only">
        Admin token
      </label>
      <input
        id="token"
        name="token"
        type="password"
        required
        autoComplete="off"
        placeholder="Admin token"
        className="mt-5 w-full border border-charcoal/20 px-4 py-3 text-[14px] outline-none focus:border-navy"
      />
      {state.error && (
        <p role="alert" className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12.5px] text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-navy px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-charcoal disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Open dashboard
      </button>
    </form>
  );
}
