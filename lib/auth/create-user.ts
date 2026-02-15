import { hashPassword } from "better-auth/crypto";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ManagedUserRole = "client" | "talent" | "company" | "super_admin";
export type ManagedAccountTier = "free" | "pro" | "enterprise";

export async function createCredentialUser(input: {
  name: string;
  email: string;
  password: string;
  role: ManagedUserRole;
  accountTier?: ManagedAccountTier;
  emailVerified?: boolean;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(user.email, normalizedEmail),
  });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const userId = nanoid(32);
  const now = new Date();
  const passwordHash = await hashPassword(input.password);

  await db.insert(user).values({
    id: userId,
    name: input.name.trim(),
    email: normalizedEmail,
    emailVerified: input.emailVerified ?? true,
    role: input.role,
    accountTier: input.accountTier ?? "free",
    accountTierStatus: "active",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: nanoid(32),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  return { userId };
}
