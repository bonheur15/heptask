import { createAuthClient } from "better-auth/react";
import { emailPasswordClient } from "better-auth/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    emailPasswordClient(),
  ]
});

export const { signIn, signOut, signUp, useSession } = authClient;