"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { companyAutoApply, companyPriorityInterest, project } from "@/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getCompanyPriorityData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const priorityProjects = await db.query.project.findMany({
    where: and(
      ne(project.clientId, session.user.id),
      ne(project.status, "completed"),
    ),
    orderBy: desc(project.createdAt),
  });

  const autoApply = await db.query.companyAutoApply.findFirst({
    where: eq(companyAutoApply.companyId, session.user.id),
  });

  const interests = await db.query.companyPriorityInterest.findMany({
    where: eq(companyPriorityInterest.companyId, session.user.id),
  });

  return {
    priorityProjects,
    autoApply,
    interests,
  };
}

export async function saveAutoApplySettings(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const enabled = formData.get("enabled") === "true";
  const focusSkills = String(formData.get("focusSkills") ?? "").trim();
  const minBudget = String(formData.get("minBudget") ?? "").trim();

  const existing = await db.query.companyAutoApply.findFirst({
    where: eq(companyAutoApply.companyId, session.user.id),
  });

  if (existing) {
    await db.update(companyAutoApply)
      .set({
        enabled,
        focusSkills: focusSkills || null,
        minBudget: minBudget || null,
        updatedAt: new Date(),
      })
      .where(eq(companyAutoApply.companyId, session.user.id));
  } else {
    await db.insert(companyAutoApply).values({
      id: nanoid(),
      companyId: session.user.id,
      enabled,
      focusSkills: focusSkills || null,
      minBudget: minBudget || null,
    });
  }

  revalidatePath("/company/priority");
}

export async function expressPriorityInterest(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return;
  }

  const existing = await db.query.companyPriorityInterest.findFirst({
    where: and(
      eq(companyPriorityInterest.companyId, session.user.id),
      eq(companyPriorityInterest.projectId, projectId),
    ),
  });

  if (existing) {
    return;
  }

  await db.insert(companyPriorityInterest).values({
    id: nanoid(),
    companyId: session.user.id,
    projectId,
    status: "applied",
  });

  revalidatePath("/company/priority");
}
