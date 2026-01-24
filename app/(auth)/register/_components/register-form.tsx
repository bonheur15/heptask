"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { requestPasswordResetForExisting } from "../_actions";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingEmail, setIsExistingEmail] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setIsExistingEmail(false);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/login?signup=1",
    });

    if (error) {
      if (error.code === "USER_ALREADY_EXISTS") {
        setIsExistingEmail(true);
        toast.info("Account already exists.");
      } else {
        toast.error(error.message || "Failed to create account.");
      }
    } else {
      toast.success("Account created! Please check your email to verify.");
      router.push("/login?signup=1");
    }
    setIsLoading(false);
  }

  async function handleResendVerification() {
    setIsLoading(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/login?signup=1",
    });
    if (error) {
      toast.error(error.message || "Failed to resend verification.");
    } else {
      toast.success("Verification email resent!");
    }
    setIsLoading(false);
  }

  async function handleResetPassword() {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    const result = await requestPasswordResetForExisting({}, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Password reset link sent!");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-zinc-500">
          Start with email and password or continue with Google.
        </p>
      </div>

      <button
        type="button"
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      {!isExistingEmail ? (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      ) : (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-700">
          <p className="font-medium">This email already has an account.</p>
          <p className="text-xs text-zinc-500">Would you like us to resend the verification email or reset your password for {email}?</p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleResendVerification}
              className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Resend verification email
            </button>
            <button
              onClick={handleResetPassword}
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
              disabled={isLoading}
            >
              Reset password
            </button>
            <button
              onClick={() => setIsExistingEmail(false)}
              className="w-full text-xs text-zinc-400 hover:text-zinc-600 pt-2"
            >
              Try a different email
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-zinc-700 hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}