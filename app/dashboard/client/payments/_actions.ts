"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { escrow, escrowTransaction, milestone, payoutTransaction, project, projectMessage } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

const parseAmount = (value: string) => {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const formatAmount = (amount: number) => amount.toFixed(2);

const getProjectEscrowRemaining = async (projectId: string) => {
  const related = await db.query.escrowTransaction.findMany({
    where: eq(escrowTransaction.projectId, projectId),
  });
  const deposits = related.filter((item) => item.type === "deposit").reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const releases = related.filter((item) => item.type === "milestone_release").reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const manual = related.filter((item) => item.type === "manual_release").reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const refunds = related.filter((item) => item.type === "refund").reduce((sum, item) => sum + parseAmount(item.amount), 0);
  return Math.max(deposits - releases - manual - refunds, 0);
};

const ensureEscrowRow = async (userId: string) => {
  const existing = await db.query.escrow.findFirst({
    where: eq(escrow.userId, userId),
  });

  if (existing) return existing;

  const created = await db.insert(escrow).values({
    id: nanoid(),
    userId,
    balance: "0",
    currency: "USD",
  }).returning();

  return created[0];
};

const ensureTalentEscrowRow = async (userId: string) => {
  const existing = await db.query.escrow.findFirst({
    where: eq(escrow.userId, userId),
  });

  if (existing) return existing;

  const created = await db.insert(escrow).values({
    id: nanoid(),
    userId,
    balance: "0",
    currency: "USD",
  }).returning();

  return created[0];
};

export async function getClientPaymentsData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projects = await db.query.project.findMany({
    where: eq(project.clientId, session.user.id),
    with: {
      milestones: true,
    },
    orderBy: desc(project.updatedAt),
  });

  const projectIds = projects.map((item) => item.id);
  const transactions = projectIds.length > 0
    ? await db.query.escrowTransaction.findMany({
        where: inArray(escrowTransaction.projectId, projectIds),
        orderBy: desc(escrowTransaction.createdAt),
      })
    : [];

  const clientEscrow = await ensureEscrowRow(session.user.id);

  return {
    projects,
    transactions,
    escrow: clientEscrow,
    sessionUser: session.user,
  };
}

export async function depositFunds(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const note = String(formData.get("note") ?? "").trim();

  if (!projectId || amount <= 0) {
    return;
  }

  const targetProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!targetProject || targetProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const currentEscrow = await ensureEscrowRow(session.user.id);
  const newBalance = parseAmount(currentEscrow.balance) + amount;

  await db.transaction(async (tx) => {
    await tx.update(escrow)
      .set({ balance: formatAmount(newBalance) })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(escrowTransaction).values({
      id: nanoid(),
      userId: session.user.id,
      projectId,
      type: "deposit",
      amount: formatAmount(amount),
      note: note || null,
    });

    await tx.insert(projectMessage).values({
      id: nanoid(),
      projectId,
      senderId: null,
      role: "system",
      body: `Escrow deposit of $${formatAmount(amount)} added by ${session.user.name ?? "client"}.`,
    });
  });

  revalidatePath("/dashboard/client/payments");
  revalidatePath(`/dashboard/client/projects/${projectId}`);
}

export async function releaseMilestone(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const milestoneId = String(formData.get("milestoneId") ?? "");

  if (!projectId || !milestoneId) {
    return;
  }

  const targetProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!targetProject || targetProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const targetMilestone = await db.query.milestone.findFirst({
    where: and(eq(milestone.id, milestoneId), eq(milestone.projectId, projectId)),
  });

  if (!targetMilestone || targetMilestone.status !== "completed") {
    throw new Error("Milestone not ready for release.");
  }

  const amount = parseAmount(targetMilestone.amount ?? "0");
  const projectRemaining = await getProjectEscrowRemaining(projectId);
  if (amount > projectRemaining) {
    throw new Error("Not enough escrow to release this milestone.");
  }
  const currentEscrow = await ensureEscrowRow(session.user.id);
  const newBalance = Math.max(parseAmount(currentEscrow.balance) - amount, 0);

  await db.transaction(async (tx) => {
    await tx.update(milestone)
      .set({ status: "approved" })
      .where(eq(milestone.id, milestoneId));

    await tx.update(escrow)
      .set({ balance: formatAmount(newBalance) })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(escrowTransaction).values({
      id: nanoid(),
      userId: session.user.id,
      projectId,
      type: "milestone_release",
      amount: formatAmount(amount),
      note: targetMilestone.title,
    });

    if (targetProject.talentId) {
      const talentEscrow = await ensureTalentEscrowRow(targetProject.talentId);
      const talentBalance = parseAmount(talentEscrow.balance) + amount;
      await tx.update(escrow)
        .set({ balance: formatAmount(talentBalance) })
        .where(eq(escrow.userId, targetProject.talentId));

      await tx.insert(payoutTransaction).values({
        id: nanoid(),
        talentId: targetProject.talentId,
        projectId,
        type: "milestone_release",
        amount: formatAmount(amount),
        note: targetMilestone.title,
      });
    }

    await tx.insert(projectMessage).values({
      id: nanoid(),
      projectId,
      senderId: null,
      role: "system",
      body: `Milestone ${targetMilestone.title} approved and $${formatAmount(amount)} released.`,
    });
  });

  revalidatePath("/dashboard/client/payments");
  revalidatePath(`/dashboard/client/work/${projectId}`);
}

export async function manualRelease(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const note = String(formData.get("note") ?? "").trim();

  if (!projectId || amount <= 0) {
    return;
  }

  const targetProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!targetProject || targetProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const manualTotal = await db.query.escrowTransaction.findMany({
    where: and(
      eq(escrowTransaction.projectId, projectId),
      eq(escrowTransaction.type, "manual_release"),
    ),
  });

  const alreadyReleased = manualTotal.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const maxManual = parseAmount(targetProject.budget ?? "0") * 0.5;

  if (alreadyReleased + amount > maxManual) {
    throw new Error("Manual release limit reached.");
  }

  const projectRemaining = await getProjectEscrowRemaining(projectId);
  if (amount > projectRemaining) {
    throw new Error("Not enough escrow to release.");
  }

  const currentEscrow = await ensureEscrowRow(session.user.id);
  const newBalance = Math.max(parseAmount(currentEscrow.balance) - amount, 0);

  await db.transaction(async (tx) => {
    await tx.update(escrow)
      .set({ balance: formatAmount(newBalance) })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(escrowTransaction).values({
      id: nanoid(),
      userId: session.user.id,
      projectId,
      type: "manual_release",
      amount: formatAmount(amount),
      note: note || "Manual release",
    });

    if (targetProject.talentId) {
      const talentEscrow = await ensureTalentEscrowRow(targetProject.talentId);
      const talentBalance = parseAmount(talentEscrow.balance) + amount;
      await tx.update(escrow)
        .set({ balance: formatAmount(talentBalance) })
        .where(eq(escrow.userId, targetProject.talentId));

      await tx.insert(payoutTransaction).values({
        id: nanoid(),
        talentId: targetProject.talentId,
        projectId,
        type: "manual_release",
        amount: formatAmount(amount),
        note: note || "Manual release",
      });
    }

    await tx.insert(projectMessage).values({
      id: nanoid(),
      projectId,
      senderId: null,
      role: "system",
      body: `Manual release of $${formatAmount(amount)} approved by ${session.user.name ?? "client"}.`,
    });
  });

  revalidatePath("/dashboard/client/payments");
  revalidatePath(`/dashboard/client/work/${projectId}`);
}

export async function refundEscrow(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectId = String(formData.get("projectId") ?? "");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const note = String(formData.get("note") ?? "").trim();

  if (!projectId || amount <= 0) {
    return;
  }

  const targetProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!targetProject || targetProject.clientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const projectRemaining = await getProjectEscrowRemaining(projectId);
  if (amount > projectRemaining) {
    throw new Error("Refund exceeds escrow balance.");
  }

  const currentEscrow = await ensureEscrowRow(session.user.id);
  const newBalance = Math.max(parseAmount(currentEscrow.balance) - amount, 0);

  await db.transaction(async (tx) => {
    await tx.update(escrow)
      .set({ balance: formatAmount(newBalance) })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(escrowTransaction).values({
      id: nanoid(),
      userId: session.user.id,
      projectId,
      type: "refund",
      amount: formatAmount(amount),
      note: note || "Refund request",
    });

    await tx.insert(projectMessage).values({
      id: nanoid(),
      projectId,
      senderId: null,
      role: "system",
      body: `Refund of $${formatAmount(amount)} requested by ${session.user.name ?? "client"}.`,
    });
  });

  revalidatePath("/dashboard/client/payments");
}
