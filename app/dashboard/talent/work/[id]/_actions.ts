"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { deliverySubmission, milestone, project, projectMessage } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getTalentWorkspaceData(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      milestones: true,
      files: {
        with: {
          uploader: true,
        },
      },
      client: true,
      talent: true,
    },
  });

  if (!workspaceProject || workspaceProject.talentId !== session.user.id) {
    throw new Error("Not found");
  }

  const messages = await db.query.projectMessage.findMany({
    where: eq(projectMessage.projectId, projectId),
    with: {
      sender: true,
    },
    orderBy: asc(projectMessage.createdAt),
  });

  const deliveries = await db.query.deliverySubmission.findMany({
    where: eq(deliverySubmission.projectId, projectId),
    with: {
      milestone: true,
      submitter: true,
      file: true,
    },
    orderBy: asc(deliverySubmission.createdAt),
  });

  return {
    project: workspaceProject,
    messages,
    deliveries,
    sessionUser: session.user,
  };
}

export async function sendTalentMessage(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!projectId || !message) {
    return;
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!workspaceProject || workspaceProject.talentId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.insert(projectMessage).values({
    id: nanoid(),
    projectId,
    senderId: session.user.id,
    role: "talent",
    body: message,
  });

  revalidatePath(`/dashboard/talent/work/${projectId}`);
}

export async function updateTalentMilestoneStatus(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const milestoneId = String(formData.get("milestoneId") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowedStatuses = new Set(["in_progress", "completed"]);

  if (!projectId || !milestoneId || !status || !allowedStatuses.has(status)) {
    return;
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!workspaceProject || workspaceProject.talentId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const targetMilestone = await db.query.milestone.findFirst({
    where: and(eq(milestone.id, milestoneId), eq(milestone.projectId, projectId)),
  });

  await db.update(milestone)
    .set({ status })
    .where(eq(milestone.id, milestoneId));

  await db.insert(projectMessage).values({
    id: nanoid(),
    projectId,
    senderId: null,
    role: "system",
    body: `Milestone ${targetMilestone?.title ?? milestoneId} marked ${status.replace("_", " ")} by talent.`,
  });

  revalidatePath(`/dashboard/talent/work/${projectId}`);
}

export async function submitTalentDelivery(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const milestoneId = String(formData.get("milestoneId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");

  if (!projectId || !summary) {
    return;
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!workspaceProject || workspaceProject.talentId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const targetMilestone = milestoneId
    ? await db.query.milestone.findFirst({
        where: and(eq(milestone.id, milestoneId), eq(milestone.projectId, projectId)),
      })
    : null;

  await db.insert(deliverySubmission).values({
    id: nanoid(),
    projectId,
    milestoneId: milestoneId || null,
    submittedBy: session.user.id,
    summary,
    link: link || null,
    fileId: fileId || null,
    status: "pending",
  });

  if (milestoneId) {
    await db.update(milestone)
      .set({ status: "completed" })
      .where(eq(milestone.id, milestoneId));
  }

  await db.insert(projectMessage).values({
    id: nanoid(),
    projectId,
    senderId: null,
    role: "system",
    body: `Delivery submitted${targetMilestone ? ` for ${targetMilestone.title}` : ""}.`,
  });

  revalidatePath(`/dashboard/talent/work/${projectId}`);
}
