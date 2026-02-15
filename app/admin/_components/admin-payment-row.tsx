"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  adminUpdatePublicationPayment,
  adminUpdateUpgradePayment,
  adminUpdateWithdrawal,
} from "../_actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaymentRow =
  | {
    kind: "withdrawal";
    id: string;
    userId: string;
    amount: string;
    status: string;
    note: string | null;
    createdAt: Date;
  }
  | {
    kind: "publication" | "upgrade";
    id: string;
    txRef: string;
    amount: string;
    status: string;
    note: string | null;
    createdAt: Date;
  };

export function AdminPaymentRow({ item }: { item: PaymentRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.note ?? "");

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {item.kind === "withdrawal" ? `Withdrawal • user ${item.userId}` : `${item.kind} • tx ${item.txRef}`}
        </p>
        <Badge variant={status === "paid" ? "default" : status === "failed" || status === "rejected" ? "destructive" : "secondary"}>
          {status}
        </Badge>
      </div>
      <p className="mb-2 text-xs text-zinc-500">
        ${item.amount} • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </p>
      <div className="grid gap-2 md:grid-cols-4">
        <Select value={status} onValueChange={(value) => setStatus(value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {item.kind === "withdrawal" ? (
              <>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
                <SelectItem value="paid">paid</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="paid">paid</SelectItem>
                <SelectItem value="failed">failed</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <Input className="md:col-span-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" />
        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                if (item.kind === "withdrawal") {
                  await adminUpdateWithdrawal({
                    withdrawalId: item.id,
                    status: status as "pending" | "processing" | "approved" | "rejected" | "paid",
                    note,
                  });
                } else if (item.kind === "publication") {
                  await adminUpdatePublicationPayment({
                    paymentId: item.id,
                    status: status as "processing" | "paid" | "failed",
                    note,
                  });
                } else {
                  await adminUpdateUpgradePayment({
                    paymentId: item.id,
                    status: status as "processing" | "paid" | "failed",
                    note,
                  });
                }
                toast.success("Payment updated.");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Update failed.");
              }
            });
          }}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
    </div>
  );
}
