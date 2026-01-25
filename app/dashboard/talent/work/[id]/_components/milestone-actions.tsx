"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updateTalentMilestoneStatus } from "../_actions";

interface MilestoneActionsProps {
  projectId: string;
  milestoneId: string;
  disableStart: boolean;
  disableSubmit: boolean;
}

export function MilestoneActions({
  projectId,
  milestoneId,
  disableStart,
  disableSubmit,
}: MilestoneActionsProps) {
  const [isPending, startTransition] = useTransition();

  const submitStatus = (status: "in_progress" | "completed") => {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("milestoneId", milestoneId);
    formData.set("status", status);
    startTransition(async () => {
      try {
        await updateTalentMilestoneStatus(formData);
        toast.success(status === "completed" ? "Milestone sent for review." : "Milestone marked in progress.");
      } catch (error) {
        toast.error("Milestone update failed.");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => submitStatus("in_progress")}
        disabled={disableStart || isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark In Progress"}
      </Button>
      <Button
        size="sm"
        onClick={() => submitStatus("completed")}
        disabled={disableSubmit || isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Review"}
      </Button>
    </div>
  );
}
