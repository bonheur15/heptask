"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { escrow, escrowTransaction, project, projectMessage, projectPublicationPayment } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { AiModelId } from "@/lib/ai/models";
import { ProjectPlan } from "@/lib/types";
import {
  generateProjectQuestions,
  generateProjectPlanDetails,
} from "@/lib/ai/gemini";
import { initializeFlutterwavePayment, verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave";

export async function generateAiQuestions(
  idea: string,
  modelId: AiModelId = "gemini-2.5-flash-lite-preview-09-2025",
) {
  return generateProjectQuestions(modelId, idea);
}

export async function generateProjectPlan(data: {
  idea: string;
  answers: Record<string, string>;
  mode: "fast" | "advanced";
  modelId: AiModelId;
}) {
  return generateProjectPlanDetails(
    data.modelId,
    data.idea,
    data.answers,
    data.mode,
  );
}

export async function createFinalProject(data: {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  plan: ProjectPlan;
  status: "draft" | "active";
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  if (data.status === "draft") {
    const projectId = nanoid();
    await db.insert(project).values({
      id: projectId,
      title: data.title,
      description: data.description,
      budget: data.budget,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: data.status,
      clientId: session.user.id,
      plan: JSON.stringify(data.plan),
    });

    revalidatePath("/dashboard/client");
    return { id: projectId };
  }

  const draftProjectId = nanoid();
  await db.insert(project).values({
    id: draftProjectId,
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: data.deadline ? new Date(data.deadline) : null,
    status: "draft",
    clientId: session.user.id,
    plan: JSON.stringify(data.plan),
  });

  const checkout = await startPublicationCheckoutForProject(draftProjectId);
  revalidatePath("/dashboard/client");
  return { ...checkout, id: draftProjectId };
}

const getProjectPublicationChargeAmount = (budget: string | null) => {
  const amountFromBudget = Number.parseFloat((budget ?? "").replace(/[^0-9.]/g, ""));
  const chargeAmount = Number.isFinite(amountFromBudget) && amountFromBudget > 0
    ? amountFromBudget
    : 0;
  return chargeAmount;
};

export async function startPublicationCheckoutForProject(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const targetProject = await db.query.project.findFirst({
    where: and(
      eq(project.id, projectId),
      eq(project.clientId, session.user.id),
    ),
  });

  if (!targetProject) {
    throw new Error("Project not found.");
  }

  if (targetProject.status === "active") {
    throw new Error("Project is already active.");
  }

  const chargeAmount = getProjectPublicationChargeAmount(targetProject.budget);
  if (chargeAmount <= 0) {
    throw new Error("Project budget must be a valid positive amount before publishing.");
  }

  const currency = process.env.FLUTTERWAVE_DEFAULT_CURRENCY ?? "USD";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const txRef = `heptadev-publish-${session.user.id}-${Date.now()}-${nanoid(6)}`;

  await db.insert(projectPublicationPayment).values({
    id: nanoid(),
    userId: session.user.id,
    txRef,
    amount: chargeAmount.toFixed(2),
    currency,
    status: "processing",
    projectPayload: targetProject.plan ?? "{}",
    projectId: targetProject.id,
  });

  let payment: { link: string };
  try {
    payment = await initializeFlutterwavePayment({
      txRef,
      amount: chargeAmount,
      currency,
      redirectUrl: `${appBaseUrl}/dashboard/client/projects/create/payment-callback`,
      customer: {
        email: session.user.email,
        name: session.user.name ?? "Client",
      },
      customizations: {
        title: "Heptadev Project Publication",
        description: `Payment for publishing project: ${targetProject.title}`,
      },
    });
  } catch (error) {
    await db
      .update(projectPublicationPayment)
      .set({
        status: "failed",
        note: error instanceof Error ? error.message : "Unable to initialize payment",
        updatedAt: new Date(),
      })
      .where(eq(projectPublicationPayment.txRef, txRef));
    throw error;
  }

  await db
    .update(projectPublicationPayment)
    .set({
      paymentLink: payment.link,
      updatedAt: new Date(),
    })
    .where(eq(projectPublicationPayment.txRef, txRef));

  revalidatePath("/dashboard/client");
  return { checkoutUrl: payment.link, txRef };
}

export async function finalizePublishedProjectPayment(data: {
  txRef: string;
  transactionId: string;
  callbackStatus?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const paymentSession = await db.query.projectPublicationPayment.findFirst({
    where: and(
      eq(projectPublicationPayment.txRef, data.txRef),
      eq(projectPublicationPayment.userId, session.user.id),
    ),
  });

  if (!paymentSession) {
    throw new Error("Payment session not found.");
  }

  if (paymentSession.status === "paid" && paymentSession.projectId) {
    return {
      projectId: paymentSession.projectId,
      status: "paid" as const,
    };
  }

  if (data.callbackStatus && data.callbackStatus !== "successful") {
    await db.update(projectPublicationPayment).set({
      status: "failed",
      note: `Callback status: ${data.callbackStatus}`,
      updatedAt: new Date(),
    }).where(eq(projectPublicationPayment.id, paymentSession.id));
    throw new Error("Payment was not successful.");
  }

  const verifiedTx = await verifyFlutterwaveTransaction(data.transactionId);
  const expectedAmount = Number.parseFloat(paymentSession.amount);
  const paidAmount = Number(verifiedTx.charged_amount || verifiedTx.amount || 0);

  if (
    verifiedTx.tx_ref !== paymentSession.txRef
    || verifiedTx.status !== "successful"
    || verifiedTx.currency !== paymentSession.currency
    || paidAmount + 0.0001 < expectedAmount
  ) {
    await db.update(projectPublicationPayment).set({
      status: "failed",
      note: "Flutterwave verification mismatch",
      flutterwaveTransactionId: String(verifiedTx.id),
      updatedAt: new Date(),
    }).where(eq(projectPublicationPayment.id, paymentSession.id));
    throw new Error("Payment verification failed.");
  }

  const now = new Date();
  const companyExclusiveUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let finalProjectId = paymentSession.projectId ?? "";

  await db.transaction(async (tx) => {
    let projectId = paymentSession.projectId;
    if (!projectId) {
      // Backward-compatible fallback for any old staged payload rows.
      const payload = JSON.parse(paymentSession.projectPayload) as {
        projectId: string;
        title: string;
        description: string;
        budget: string;
        deadline: string;
        plan: ProjectPlan;
      };
      projectId = payload.projectId;
      finalProjectId = payload.projectId;
      const existingProject = await tx.query.project.findFirst({
        where: eq(project.id, payload.projectId),
      });
      if (!existingProject) {
        await tx.insert(project).values({
          id: payload.projectId,
          title: payload.title,
          description: payload.description,
          budget: payload.budget,
          deadline: payload.deadline ? new Date(payload.deadline) : null,
          status: "draft",
          clientId: session.user.id,
          plan: JSON.stringify(payload.plan),
        });
      }
    }

    await tx.update(project).set({
      status: "active",
      publishedAt: now,
      companyExclusiveUntil,
      updatedAt: new Date(),
    }).where(and(
      eq(project.id, projectId),
      eq(project.clientId, session.user.id),
    ));
    finalProjectId = projectId;

    let currentEscrow = await tx.query.escrow.findFirst({
      where: eq(escrow.userId, session.user.id),
    });
    if (!currentEscrow) {
      const created = await tx.insert(escrow).values({
        id: nanoid(),
        userId: session.user.id,
        balance: "0",
        currency: paymentSession.currency,
      }).returning();
      currentEscrow = created[0];
    }
    const currentBalance = Number.parseFloat(currentEscrow.balance ?? "0") || 0;
    const newBalance = (currentBalance + expectedAmount).toFixed(2);

    await tx.update(escrow)
      .set({
        balance: newBalance,
      })
      .where(eq(escrow.userId, session.user.id));

    await tx.insert(escrowTransaction).values({
      id: nanoid(),
      userId: session.user.id,
      projectId,
      type: "deposit",
      amount: expectedAmount.toFixed(2),
      note: `Flutterwave payment ${verifiedTx.id}`,
    });

    await tx.insert(projectMessage).values({
      id: nanoid(),
      projectId,
      senderId: null,
      role: "system",
      body: `Project published after Flutterwave payment verification. Company-priority window ends in 24 hours.`,
    });

    await tx.update(projectPublicationPayment).set({
      status: "paid",
      projectId,
      flutterwaveTransactionId: String(verifiedTx.id),
      note: "Payment verified and project published.",
      updatedAt: new Date(),
    }).where(eq(projectPublicationPayment.id, paymentSession.id));
  });

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/payments");
  revalidatePath("/projects");
  revalidatePath("/dashboard/talent/jobs");
  revalidatePath("/company/priority");

  return {
    projectId: finalProjectId,
    status: "paid" as const,
  };
}
