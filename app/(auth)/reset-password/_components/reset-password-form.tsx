"use client";

import { useActionState } from "react";
import { resetPassword } from "../_actions";

type Props = {
  token: string;
  error?: string;
};

export default function ResetPasswordForm({ token, error }: Props) {
  const [state, formAction, pending] = useActionState(resetPassword, {});

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Reset link is invalid</h1>
        <p className="text-sm text-zinc-500">
          Request a new reset link to continue.
        </p>
        <a
          href="/forgot-password"
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
        >
          Request new link
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="text-sm text-zinc-500">
          Make sure it is strong and unique.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="password"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor="confirm"
          >
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </div>
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
          {pending ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
