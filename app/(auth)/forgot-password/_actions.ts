"use server";

import { APIError } from "better-call";
import { auth } from "@/auth";
import { getBaseUrl } from "@/app/(auth)/_utils/auth-urls";

export type ResetRequestState = {
  error?: string;
  message?: string;
};

export const requestReset = async (
  _: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> => {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: `${getBaseUrl()}/reset-password` },
    });
    return { message: "Check your email for a reset link." };
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.message || "Unable to request reset." };
    }
    return { error: "Unable to request reset." };
  }
};
