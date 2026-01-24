"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project, applicant, ndaSignature, notification } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
export type ProposedMilestone = {
  id: string;
  title: string;
  amount: string;
  dueDate: Date | null;
};

export async function getJobDetails(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const job = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      client: true,
      milestones: true,
    },
  });

  if (!job) throw new Error("Job not found");

  const signature = await db.query.ndaSignature.findFirst({
    where: and(
      eq(ndaSignature.projectId, projectId),
      eq(ndaSignature.userId, session.user.id)
    ),
  });

  const existingApplication = await db.query.applicant.findFirst({
    where: and(
      eq(applicant.projectId, projectId),
      eq(applicant.userId, session.user.id)
    ),
  });

  return {
    job,
    ndaSigned: !!signature,
    hasApplied: !!existingApplication,
    application: existingApplication,
  };
}

export async function signNda(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  await db.insert(ndaSignature).values({
    id: nanoid(),
    projectId,
    userId: session.user.id,
  });

  revalidatePath(`/dashboard/talent/jobs/${projectId}`);
}

export async function submitApplication(data: {
  projectId: string;
  proposal: string;
  budget: string;
  timeline: string;
  milestones?: ProposedMilestone[];
  links?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  // Verify NDA is signed
  const signature = await db.query.ndaSignature.findFirst({
    where: and(
      eq(ndaSignature.projectId, data.projectId),
      eq(ndaSignature.userId, session.user.id)
    ),
  });

  if (!signature) throw new Error("NDA must be signed before applying");

  await db.insert(applicant).values({
    id: nanoid(),
    projectId: data.projectId,
    userId: session.user.id,
    proposal: data.proposal,
    budget: data.budget,
    timeline: data.timeline,
    proposedMilestones: data.milestones ? JSON.stringify(data.milestones) : null,
    relevantLinks: data.links,
    ndaSigned: true,
  });

  // Notify client
  const job = await db.query.project.findFirst({
    where: eq(project.id, data.projectId),
  });

  if (job) {
    await db.insert(notification).values({
      id: nanoid(),
      userId: job.clientId,
      type: "project_update",
      title: "New Application Received",
      message: `${session.user.name} has applied to your project: ${job.title}`,
      link: `/dashboard/client/projects/${job.id}`,
    });
  }

  revalidatePath(`/dashboard/talent/jobs/${data.projectId}`);
  revalidatePath("/dashboard/talent");
}
