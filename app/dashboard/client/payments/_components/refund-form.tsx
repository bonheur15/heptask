"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { refundEscrow } from "../_actions";

interface ProjectOption {
  id: string;
  title: string;
}

interface RefundFormProps {
  projects: ProjectOption[];
}

export function RefundForm({ projects }: RefundFormProps) {
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
            await refundEscrow(formData);
            form.reset();
            toast.success("Refund request submitted.");
          } catch (error) {
            toast.error("Refund failed.");
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
          <Input name="amount" placeholder="300" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Reason</label>
          <Input name="note" placeholder="Scope change or cancellation" />
        </div>
      </div>
      <Button className="gap-2" disabled={isPending} type="submit" variant="outline">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Submitting..." : "Request Refund"}
      </Button>
      <p className="text-[11px] text-zinc-500">
        Refunds are reviewed if any milestones are already approved.
      </p>
    </form>
  );
}
