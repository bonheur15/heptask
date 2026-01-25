"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  companyAssignment,
  companyAutoApply,
  companyInvite,
  companyTeam,
  project,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getCompanyDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const teamMembers = await db.query.companyTeam.findMany({
    where: eq(companyTeam.companyId, session.user.id),
    with: {
      member: true,
    },
    orderBy: desc(companyTeam.createdAt),
  });

  const invites = await db.query.companyInvite.findMany({
    where: eq(companyInvite.companyId, session.user.id),
    orderBy: desc(companyInvite.createdAt),
  });

  const teamMemberIds = teamMembers.map((member) => member.memberId);
  const assignments = teamMemberIds.length
    ? await db.query.companyAssignment.findMany({
        where: inArray(companyAssignment.memberId, teamMemberIds),
        with: {
          project: true,
          member: true,
        },
        orderBy: desc(companyAssignment.createdAt),
      })
    : [];

  const assignedJobs = assignments.filter(
    (assignment) => assignment.project.talentId === session.user.id,
  );

  const autoApply = await db.query.companyAutoApply.findFirst({
    where: eq(companyAutoApply.companyId, session.user.id),
  });

  const activeJobs = assignedJobs.filter((item) => item.project.status !== "completed");
  const completedJobs = assignedJobs.filter((item) => item.project.status === "completed");

  return {
    teamMembers,
    invites,
    assignedJobs,
    activeJobs,
    completedJobs,
    autoApply,
    sessionUser: session.user,
  };
}

export async function toggleAutoApply(formData: FormData) {
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

  revalidatePath("/company/dashboard");
}

export async function assignTeamMember(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const allocation = String(formData.get("allocation") ?? "0");

  if (!projectId || !memberId) {
    return;
  }

  const teamMember = await db.query.companyTeam.findFirst({
    where: and(
      eq(companyTeam.companyId, session.user.id),
      eq(companyTeam.memberId, memberId),
    ),
  });

  if (!teamMember) {
    throw new Error("Team member not found.");
  }

  await db.insert(companyAssignment).values({
    id: nanoid(),
    projectId,
    memberId,
    allocation,
    status: "assigned",
  });

  revalidatePath("/company/dashboard");
}
