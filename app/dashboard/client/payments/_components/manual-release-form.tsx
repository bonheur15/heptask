"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { manualRelease } from "../_actions";

interface ProjectOption {
  id: string;
  title: string;
  manualReleased: number;
  maxManualRelease: number;
}

interface ManualReleaseFormProps {
  projects: ProjectOption[];
}

export function ManualReleaseForm({ projects }: ManualReleaseFormProps) {
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
            await manualRelease(formData);
            form.reset();
            toast.success("Manual release completed.");
          } catch (error) {
            toast.error("Manual release failed.");
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
              {project.title} (Released ${project.manualReleased.toFixed(0)} / ${project.maxManualRelease.toFixed(0)})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Amount</label>
          <Input name="amount" placeholder="500" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Reason</label>
          <Input name="note" placeholder="Materials or early costs" />
        </div>
      </div>
      <Button className="gap-2" disabled={isPending} type="submit" variant="outline">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Releasing..." : "Manual Release"}
      </Button>
      <p className="text-[11px] text-amber-600">
        Manual releases are capped at 50% of the project budget.
      </p>
    </form>
  );
}
