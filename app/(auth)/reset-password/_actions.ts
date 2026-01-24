"use server";

import { APIError } from "better-call";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type ResetState = {
  error?: string;
};

export const resetPassword = async (_: ResetState, formData: FormData): Promise<ResetState> => {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token) {
    return { error: "Reset token is missing." };
  }
  if (!password || !confirm) {
    return { error: "Password and confirmation are required." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  try {
    await auth.api.resetPassword({
      body: { newPassword: password, token },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.message || "Unable to reset password." };
    }
    return { error: "Unable to reset password." };
  }

  redirect("/login?reset=1");
};
