"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { escrow, payoutTransaction, project, withdrawalRequest } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

const parseAmount = (value: string) => {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const formatAmount = (amount: number) => amount.toFixed(2);

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

export async function getTalentPaymentsData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const wallet = await ensureEscrowRow(session.user.id);

  const payouts = await db.query.payoutTransaction.findMany({
    where: eq(payoutTransaction.talentId, session.user.id),
    orderBy: desc(payoutTransaction.createdAt),
  });

  const withdrawals = await db.query.withdrawalRequest.findMany({
    where: eq(withdrawalRequest.userId, session.user.id),
    orderBy: desc(withdrawalRequest.createdAt),
  });

  const projectIds = payouts.map((item) => item.projectId);
  const projects = projectIds.length > 0
    ? await db.query.project.findMany({
        where: eq(project.talentId, session.user.id),
        orderBy: asc(project.createdAt),
      })
    : [];

  return {
    wallet,
    payouts,
    withdrawals,
    projects,
    sessionUser: session.user,
  };
}

export async function requestWithdrawal(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const method = String(formData.get("method") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (amount <= 0 || !method) {
    return;
  }

  const wallet = await ensureEscrowRow(session.user.id);
  const balance = parseAmount(wallet.balance);

  if (amount > balance) {
    throw new Error("Insufficient balance.");
  }

  const newBalance = balance - amount;

  await db.transaction(async (tx) => {
    await tx.update(escrow)
      .set({ balance: formatAmount(newBalance) })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(withdrawalRequest).values({
      id: nanoid(),
      userId: session.user.id,
      amount: formatAmount(amount),
      method,
      note: note || null,
      status: "pending",
    });
  });

  revalidatePath("/dashboard/talent/payments");
}
