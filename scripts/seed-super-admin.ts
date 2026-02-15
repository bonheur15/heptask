import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import { createCredentialUser } from "../lib/auth/create-user";

async function run() {
  const email = (process.env.SUPER_ADMIN_EMAIL || "superadmin@heptadev.local").trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@1234";
  const name = process.env.SUPER_ADMIN_NAME || "Heptadev Super Admin";

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existing) {
    await db.update(user).set({
      role: "super_admin",
      accountTier: "enterprise",
      accountTierStatus: "active",
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(user.id, existing.id));
    console.log(`Updated existing account as super_admin: ${email}`);
    return;
  }

  await createCredentialUser({
    name,
    email,
    password,
    role: "super_admin",
    accountTier: "enterprise",
    emailVerified: true,
  });

  console.log("Super admin account created:");
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed super admin:", error);
    process.exit(1);
  });
