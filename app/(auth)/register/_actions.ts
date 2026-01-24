"use server";

import { APIError } from "better-call";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { applySetCookie } from "@/app/(auth)/_utils/auth-cookies";
import { getBaseUrl } from "@/app/(auth)/_utils/auth-urls";
import { BASE_ERROR_CODES } from "@better-auth/core/error";

export type SignUpState = {
  error?: string;
  message?: string;
  existingEmail?: boolean;
  email?: string;
};

const getCallbackUrl = () => `${getBaseUrl()}/login?signup=1`;

export const signUp = async (_: SignUpState, formData: FormData): Promise<SignUpState> => {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: getCallbackUrl() },
      returnHeaders: true,
    });
    await applySetCookie(result.headers);
  } catch (error) {
    if (error instanceof APIError) {
      if (
        error.message ===
        BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL
      ) {
        return {
          existingEmail: true,
          email,
          message:
            "This email already has an account. Would you like us to resend the verification email or reset your password?",
        };
      }
      return { error: error.message || "Unable to sign up." };
    }
    return { error: "Unable to sign up." };
  }

  redirect("/login?signup=1");
};

export const signUpWithGoogle = async () => {
  const result = await auth.api.signInSocial({
    body: { provider: "google", disableRedirect: true },
    returnHeaders: true,
  });

  await applySetCookie(result.headers);

  if (!result.response?.url) {
    throw new Error("Google sign-up is not available.");
  }

  redirect(result.response.url);
};

export type ExistingEmailState = {
  error?: string;
  message?: string;
  verified?: boolean;
  email?: string;
};

export const resendVerificationForExisting = async (
  _: ExistingEmailState,
  formData: FormData,
): Promise<ExistingEmailState> => {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required.", email };
  }
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: getCallbackUrl() },
    });
    return {
      message: "Verification email sent. Check your inbox.",
      email,
    };
  } catch (error) {
    if (error instanceof APIError) {
      if (error.message === BASE_ERROR_CODES.EMAIL_ALREADY_VERIFIED) {
        return {
          verified: true,
          email,
          message:
            "Your email is already verified. You can reset your password instead.",
        };
      }
      return { error: error.message || "Unable to resend verification.", email };
    }
    return { error: "Unable to resend verification.", email };
  }
};

export const requestPasswordResetForExisting = async (
  _: ExistingEmailState,
  formData: FormData,
): Promise<ExistingEmailState> => {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required.", email };
  }
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: `${getBaseUrl()}/reset-password` },
    });
    return {
      message: "Password reset link sent. Check your email.",
      email,
    };
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.message || "Unable to send reset.", email };
    }
    return { error: "Unable to send reset.", email };
  }
};
