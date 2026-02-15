"use server";

import { APIError } from "better-call";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { applySetCookie } from "@/app/(auth)/_utils/auth-cookies";
import { getBaseUrl } from "@/app/(auth)/_utils/auth-urls";

export type SignInState = {
  error?: string;
  message?: string;
};

const getCallbackUrl = () => `${getBaseUrl()}/dashboard`;

export const signIn = async (
  _: SignInState,
  formData: FormData,
): Promise<SignInState> => {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password, callbackURL: getCallbackUrl() },
      returnHeaders: true,
    });
    await applySetCookie(result.headers);
  } catch (error) {
    console.error("Sign in error:", error);
    if (error instanceof APIError) {
      return { error: error.message || "Unable to sign in." };
    }
    return { error: "An unexpected error occurred during sign in." };
  }

  redirect("/dashboard");
};

export const signInWithGoogle = async () => {
  const result = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: `${getBaseUrl()}/dashboard` },
  });
  if (!result.url) {
    throw new Error("Google sign-in is not available.");
  }

  redirect(result.url);
};
