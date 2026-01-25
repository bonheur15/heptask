import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { escrowTransaction, project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ReceiptPrintButton } from "./_components/receipt-print-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatAmount = (value: string | null) => {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

export default async function ClientReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    notFound();
  }

  const receipt = await db.query.escrowTransaction.findFirst({
    where: eq(escrowTransaction.id, id),
  });

  if (!receipt || receipt.userId !== session.user.id) {
    notFound();
  }

  const relatedProject = await db.query.project.findFirst({
    where: eq(project.id, receipt.projectId),
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/client/payments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to payments
          </Link>
        </Button>
        <ReceiptPrintButton />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Escrow Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Receipt ID</span>
            <span className="font-semibold">{receipt.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Project</span>
            <span className="font-semibold">{relatedProject?.title ?? "Project"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Type</span>
            <span className="font-semibold capitalize">{receipt.type.replace("_", " ")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Amount</span>
            <span className="font-semibold">${formatAmount(receipt.amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Date</span>
            <span className="font-semibold">{format(receipt.createdAt, "PPP p")}</span>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs text-zinc-500">
              This receipt confirms escrow activity recorded on Heptadev. Please keep it for your records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
