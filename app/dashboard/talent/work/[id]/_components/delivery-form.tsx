"use client";

import { useState, useTransition } from "react";
import { UploadButton } from "@/components/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MilestoneOption {
  id: string;
  title: string;
}

interface DeliveryFormProps {
  projectId: string;
  milestones: MilestoneOption[];
  action: (formData: FormData) => Promise<void>;
}

export function DeliveryForm({ projectId, milestones, action }: DeliveryFormProps) {
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          try {
            await action(formData);
            form.reset();
            setFileId(null);
            setFileName(null);
            toast.success("Delivery submitted for review.");
          } catch (error) {
            toast.error("Delivery submission failed.");
          }
        });
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="fileId" value={fileId ?? ""} />

      <Textarea
        name="summary"
        placeholder="Explain what you delivered, highlight progress, and note any blockers."
        className="min-h-[160px]"
        required
      />
      <Input name="link" placeholder="Delivery link (Figma, GitHub, Drive, etc.)" />
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Attach file (optional)</label>
        <UploadButton
          endpoint="projectWorkspaceFiles"
          input={{ projectId, label: "delivery" }}
          onClientUploadComplete={(files) => {
            const completed = files[0];
            if (!completed) return;
            setFileId(String(completed.serverData?.fileId ?? ""));
            setFileName(completed.name);
          }}
          onUploadError={(error) => {
            console.error("Upload failed:", error.message);
          }}
        />
        {fileName && (
          <p className="text-xs text-zinc-500">
            Attached: {fileName}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Link to milestone</label>
        <select
          name="milestoneId"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          defaultValue=""
        >
          <option value="">General delivery</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button className="gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {isPending ? "Submitting..." : "Submit Delivery"}
        </Button>
      </div>
    </form>
  );
}
