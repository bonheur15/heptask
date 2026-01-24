"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project, milestone, applicant, projectFile, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { ProjectPlan } from "@/lib/types";

export async function getProjectDetails(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const data = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      milestones: true,
      applicants: {
        with: {
          user: true,
        },
      },
      files: {
        with: {
          uploader: true,
        },
      },
      client: true,
      talent: true,
    },
  });

  if (!data || data.clientId !== session.user.id) {
    throw new Error("Project not found or access denied");
  }

  return data;
}

export async function initializeMilestones(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const currentProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: { milestones: true },
  });

  if (!currentProject || currentProject.clientId !== session.user.id) {
    throw new Error("Access denied");
  }

  if (currentProject.milestones.length > 0) return;

  const plan = JSON.parse(currentProject.plan || "{}") as ProjectPlan;
  if (!plan.milestones) return;

  const newMilestones = plan.milestones.map((m) => ({
    id: nanoid(),
    projectId,
    title: m.title,
    description: m.description,
    status: "pending",
  }));

  await db.insert(milestone).values(newMilestones);
}

export async function acceptApplicant(projectId: string, applicantId: string, talentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  // Verify client ownership
  const p = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!p || p.clientId !== session.user.id) throw new Error("Denied");

  await db.transaction(async (tx) => {
    // Update project
    await tx.update(project).set({
      talentId,
      status: "active",
      updatedAt: new Date(),
    }).where(eq(project.id, projectId));

    // Update applicants
    await tx.update(applicant).set({
      status: "rejected"
    }).where(and(eq(applicant.projectId, projectId), eq(applicant.status, "pending")));

    await tx.update(applicant).set({
      status: "accepted"
    }).where(eq(applicant.id, applicantId));
  });

  revalidatePath(`/dashboard/client/projects/${projectId}`);
}
