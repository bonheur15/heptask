"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { accountUpgradePayment, user } from "@/db/schema";
import { getTierPrice, type AccountTier } from "@/lib/billing/plans";
import { initializeFlutterwavePayment, verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function getBillingData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const payments = await db.query.accountUpgradePayment.findMany({
    where: eq(accountUpgradePayment.userId, session.user.id),
    orderBy: desc(accountUpgradePayment.createdAt),
    limit: 20,
  });

  const account = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  return {
    user: account,
    payments,
    proPrice: getTierPrice("pro"),
    enterprisePrice: getTierPrice("enterprise"),
    currency: process.env.FLUTTERWAVE_DEFAULT_CURRENCY ?? "USD",
  };
}

export async function startAccountUpgradeCheckout(targetTier: "pro" | "enterprise") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const currentAccount = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentAccount) throw new Error("Account not found");

  const currentTier = (currentAccount.accountTier ?? "free") as AccountTier;
  if (currentTier === targetTier) {
    throw new Error(`You are already on the ${targetTier} plan.`);
  }

  if (currentTier === "enterprise") {
    throw new Error("Your account is already on the highest plan.");
  }

  const amount = getTierPrice(targetTier);
  const currency = process.env.FLUTTERWAVE_DEFAULT_CURRENCY ?? "USD";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const txRef = `heptadev-upgrade-${session.user.id}-${targetTier}-${Date.now()}-${nanoid(6)}`;

  await db.insert(accountUpgradePayment).values({
    id: nanoid(),
    userId: session.user.id,
    txRef,
    targetTier,
    amount: amount.toFixed(2),
    currency,
    status: "processing",
  });

  await db.update(user).set({
    accountTierStatus: "processing",
    updatedAt: new Date(),
  }).where(eq(user.id, session.user.id));

  let payment: { link: string };
  try {
    payment = await initializeFlutterwavePayment({
      txRef,
      amount,
      currency,
      redirectUrl: `${appBaseUrl}/dashboard/billing/callback`,
      customer: {
        email: session.user.email,
        name: session.user.name ?? "User",
      },
      customizations: {
        title: `Heptadev ${targetTier.toUpperCase()} Upgrade`,
        description: `Upgrade account plan to ${targetTier}.`,
      },
    });
  } catch (error) {
    await db.update(accountUpgradePayment).set({
      status: "failed",
      note: error instanceof Error ? error.message : "Unable to initialize checkout",
      updatedAt: new Date(),
    }).where(eq(accountUpgradePayment.txRef, txRef));

    await db.update(user).set({
      accountTierStatus: "requires_payment",
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));

    throw error;
  }

  await db.update(accountUpgradePayment).set({
    paymentLink: payment.link,
    updatedAt: new Date(),
  }).where(eq(accountUpgradePayment.txRef, txRef));

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return { checkoutUrl: payment.link, txRef };
}

export async function finalizeAccountUpgradePayment(data: {
  txRef: string;
  transactionId: string;
  callbackStatus?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const paymentSession = await db.query.accountUpgradePayment.findFirst({
    where: and(
      eq(accountUpgradePayment.txRef, data.txRef),
      eq(accountUpgradePayment.userId, session.user.id),
    ),
  });

  if (!paymentSession) {
    throw new Error("Upgrade payment not found.");
  }

  if (paymentSession.status === "paid") {
    return {
      tier: paymentSession.targetTier,
      status: "paid" as const,
    };
  }

  if (data.callbackStatus && data.callbackStatus !== "successful") {
    await db.update(accountUpgradePayment).set({
      status: "failed",
      note: `Callback status: ${data.callbackStatus}`,
      updatedAt: new Date(),
    }).where(eq(accountUpgradePayment.id, paymentSession.id));

    await db.update(user).set({
      accountTierStatus: "requires_payment",
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));

    throw new Error("Upgrade payment was not successful.");
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
    await db.update(accountUpgradePayment).set({
      status: "failed",
      note: "Flutterwave verification mismatch",
      flutterwaveTransactionId: String(verifiedTx.id),
      updatedAt: new Date(),
    }).where(eq(accountUpgradePayment.id, paymentSession.id));

    await db.update(user).set({
      accountTierStatus: "requires_payment",
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));

    throw new Error("Upgrade payment verification failed.");
  }

  await db.transaction(async (tx) => {
    await tx.update(accountUpgradePayment).set({
      status: "paid",
      flutterwaveTransactionId: String(verifiedTx.id),
      note: "Upgrade payment verified.",
      updatedAt: new Date(),
    }).where(eq(accountUpgradePayment.id, paymentSession.id));

    await tx.update(user).set({
      accountTier: paymentSession.targetTier,
      accountTierStatus: "active",
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");

  return {
    tier: paymentSession.targetTier,
    status: "paid" as const,
  };
}
