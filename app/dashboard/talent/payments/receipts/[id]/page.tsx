import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { payoutTransaction, project, withdrawalRequest } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptPrintButton } from "./_components/receipt-print-button";

const formatAmount = (value: string | null) => {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

export default async function TalentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    notFound();
  }

  const payout = await db.query.payoutTransaction.findFirst({
    where: eq(payoutTransaction.id, id),
  });

  const withdrawal = await db.query.withdrawalRequest.findFirst({
    where: eq(withdrawalRequest.id, id),
  });

  if (!payout && !withdrawal) {
    notFound();
  }

  if (payout && payout.talentId !== session.user.id) {
    notFound();
  }

  if (withdrawal && withdrawal.userId !== session.user.id) {
    notFound();
  }

  const relatedProject = payout
    ? await db.query.project.findFirst({
        where: eq(project.id, payout.projectId),
      })
    : null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/talent/payments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to payments
          </Link>
        </Button>
        <ReceiptPrintButton />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{payout ? "Payout Receipt" : "Withdrawal Receipt"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Receipt ID</span>
            <span className="font-semibold">{payout?.id ?? withdrawal?.id}</span>
          </div>
          {payout && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Project</span>
              <span className="font-semibold">{relatedProject?.title ?? "Project"}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Type</span>
            <span className="font-semibold capitalize">
              {payout ? payout.type.replace("_", " ") : withdrawal?.method ?? "withdrawal"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Amount</span>
            <span className="font-semibold">${formatAmount(payout?.amount ?? withdrawal?.amount ?? "0")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Date</span>
            <span className="font-semibold">
              {format((payout?.createdAt ?? withdrawal?.createdAt) ?? new Date(), "PPP p")}
            </span>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs text-zinc-500">
              This receipt confirms payout activity recorded on Heptadev. Keep it for your records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
