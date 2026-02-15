"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { requestWithdrawal } from "../_actions";

export function WithdrawalForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          try {
            await requestWithdrawal(formData);
            form.reset();
            toast.success("Withdrawal requested.");
          } catch (error) {
            toast.error("Withdrawal failed.");
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Amount</label>
          <Input name="amount" placeholder="250" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Method</label>
          <select
            name="method"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            required
          >
            <option value="">Select method</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bank Code</label>
          <Input name="accountBank" placeholder="e.g. 044" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account Number</label>
          <Input name="accountNumber" placeholder="0123456789" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Currency</label>
          <Input name="currency" placeholder="USD" defaultValue="USD" required />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account Name</label>
        <Input name="accountName" placeholder="Account holder name" required />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Note</label>
        <Input name="note" placeholder="Optional payout note" />
      </div>
      <Button className="gap-2" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Submitting..." : "Request Withdrawal"}
      </Button>
    </form>
  );
}
