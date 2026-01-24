"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setRole(role: "client" | "talent" | "company") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
}

export async function updateProfile(data: { 
  name: string; 
  bio?: string;
  skills?: string;
  location?: string;
  website?: string;
  companyName?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({ 
      ...data,
      updatedAt: new Date() 
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}
