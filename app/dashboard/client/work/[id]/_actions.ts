"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { deliverySubmission, milestone, project, projectMessage } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function getClientWorkspaceData(projectId: string) {
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

  if (!workspaceProject || workspaceProject.clientId !== session.user.id) {
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

export async function sendClientMessage(formData: FormData) {
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

  if (!workspaceProject || workspaceProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.insert(projectMessage).values({
    id: nanoid(),
    projectId,
    senderId: session.user.id,
    role: "client",
    body: message,
  });

  revalidatePath(`/dashboard/client/work/${projectId}`);
}

export async function updateClientMilestoneStatus(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const milestoneId = String(formData.get("milestoneId") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowedStatuses = new Set(["approved", "in_progress"]);

  if (!projectId || !milestoneId || !status || !allowedStatuses.has(status)) {
    return;
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!workspaceProject || workspaceProject.clientId !== session.user.id) {
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
    body: status === "approved"
      ? `Milestone ${targetMilestone?.title ?? milestoneId} approved by client.`
      : `Revision requested for ${targetMilestone?.title ?? milestoneId}.`,
  });

  revalidatePath(`/dashboard/client/work/${projectId}`);
}

export async function reviewDelivery(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const deliveryId = String(formData.get("deliveryId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!projectId || !deliveryId || !decision) {
    return;
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!workspaceProject || workspaceProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const status = decision === "approve" ? "approved" : "revision";

  await db.update(deliverySubmission)
    .set({ status })
    .where(eq(deliverySubmission.id, deliveryId));

  if (status === "approved") {
    const delivery = await db.query.deliverySubmission.findFirst({
      where: eq(deliverySubmission.id, deliveryId),
    });

    if (delivery?.milestoneId) {
      await db.update(milestone)
        .set({ status: "approved" })
        .where(eq(milestone.id, delivery.milestoneId));
    }
  } else {
    const delivery = await db.query.deliverySubmission.findFirst({
      where: eq(deliverySubmission.id, deliveryId),
    });

    if (delivery?.milestoneId) {
      await db.update(milestone)
        .set({ status: "in_progress" })
        .where(eq(milestone.id, delivery.milestoneId));
    }
  }

  await db.insert(projectMessage).values({
    id: nanoid(),
    projectId,
    senderId: null,
    role: "system",
    body: `Delivery ${status === "approved" ? "approved" : "returned for revision"}.`,
  });

  revalidatePath(`/dashboard/client/work/${projectId}`);
}
