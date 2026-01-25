"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { closeProjectAsComplete } from "../_actions";

interface CloseProjectProps {
  projectId: string;
  canClose: boolean;
}

export function CloseProject({ projectId, canClose }: CloseProjectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={!canClose || isPending}
      onClick={() => {
        const formData = new FormData();
        formData.set("projectId", projectId);
        startTransition(async () => {
          try {
            await closeProjectAsComplete(formData);
            toast.success("Project marked as completed.");
          } catch (error) {
            toast.error("Project cannot be closed yet.");
          }
        });
      }}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {isPending ? "Closing..." : canClose ? "Close Project" : "Complete milestones first"}
    </Button>
  );
}
