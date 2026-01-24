"use client";

import { useActionState } from "react";
import { requestReset } from "../_actions";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestReset, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-zinc-500">
          We will email you a secure reset link.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </div>
        {state?.message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.message}
          </p>
        ) : null}
        {state?.error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          disabled={pending}
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="text-center text-xs text-zinc-500">
        Remembered your password?{" "}
        <a href="/login" className="font-medium text-zinc-700 hover:underline">
          Back to sign in
        </a>
      </div>
    </div>
  );
}
