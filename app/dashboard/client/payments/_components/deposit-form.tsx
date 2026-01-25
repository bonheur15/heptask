"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { depositFunds } from "../_actions";

interface ProjectOption {
  id: string;
  title: string;
}

interface DepositFormProps {
  projects: ProjectOption[];
}

export function DepositForm({ projects }: DepositFormProps) {
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
            await depositFunds(formData);
            form.reset();
            toast.success("Escrow deposit submitted.");
          } catch (error) {
            toast.error("Deposit failed.");
          }
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project</label>
        <select
          name="projectId"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          required
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Amount</label>
          <Input name="amount" placeholder="2000" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Note (optional)</label>
          <Input name="note" placeholder="Initial escrow deposit" />
        </div>
      </div>
      <Button className="gap-2" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Depositing..." : "Deposit Funds"}
      </Button>
    </form>
  );
}
