import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { HubMail } from "hubmail";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
const appName = process.env.APP_NAME || "Starterkit";
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || baseURL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const hubmail = new HubMail();
const hubmailFrom =
  process.env.AUTH_EMAIL_FROM ||
  `no-reply@${new URL(baseURL).hostname.replace(/:\d+$/, "")}`;

const sendAuthEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  await hubmail.send({
    from: hubmailFrom,
    to: [to],
    subject,
    text,
    html,
  });
};

export const auth = betterAuth({
  appName,
  baseURL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      skills: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      website: {
        type: "string",
        required: false,
      },
      companyName: {
        type: "string",
        required: false,
      },
      accountTier: {
        type: "string",
        required: false,
      },
      accountTierStatus: {
        type: "string",
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const subject = `${appName} email verification`;
      const text = `Hello ${user.name || "there"},\n\nVerify your email to continue:\n${url}\n\nIf you did not request this, you can ignore this message.`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your email</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>Verify your email to continue:</p>
          <p><a href="${url}">Verify email</a></p>
          <p>If you did not request this, you can ignore this message.</p>
        </div>
      `;
      await sendAuthEmail({ to: user.email, subject, text, html });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const subject = `${appName} password reset`;
      const text = `Hello ${user.name || "there"},\n\nReset your password:\n${url}\n\nIf you did not request this, you can ignore this message.`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset your password</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>Reset your password using the link below:</p>
          <p><a href="${url}">Reset password</a></p>
          <p>If you did not request this, you can ignore this message.</p>
        </div>
      `;
      await sendAuthEmail({ to: user.email, subject, text, html });
    },
  },
});
