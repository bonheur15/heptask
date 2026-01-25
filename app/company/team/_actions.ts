"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { companyAssignment, companyInvite, companyTeam, project, user } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getCompanyTeamData() {
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

  const activeProjects = await db.query.project.findMany({
    where: and(
      eq(project.talentId, session.user.id),
      eq(project.status, "active"),
    ),
    orderBy: desc(project.updatedAt),
  });

  return {
    teamMembers,
    invites,
    assignedJobs,
    activeProjects,
  };
}

export async function inviteTeamMember(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "company") {
    throw new Error("Unauthorized");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member");

  if (!email) {
    return;
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existingUser && existingUser.role !== "talent") {
    throw new Error("Only talent accounts can be added to a company team.");
  }

  if (existingUser) {
    const existingTeam = await db.query.companyTeam.findFirst({
      where: and(
        eq(companyTeam.companyId, session.user.id),
        eq(companyTeam.memberId, existingUser.id),
      ),
    });

    if (!existingTeam) {
      await db.insert(companyTeam).values({
        id: nanoid(),
        companyId: session.user.id,
        memberId: existingUser.id,
        role,
        status: "active",
      });
    }
  } else {
    await db.insert(companyInvite).values({
      id: nanoid(),
      companyId: session.user.id,
      email,
      role,
      token: nanoid(),
      status: "pending",
    });
  }

  revalidatePath("/company/team");
}

export async function assignTeamMemberToProject(formData: FormData) {
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

  revalidatePath("/company/team");
}
