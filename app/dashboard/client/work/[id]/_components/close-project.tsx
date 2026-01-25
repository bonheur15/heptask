"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { closeProjectAsComplete } from "../_actions";

interface CloseProjectProps {
  projectId: string;
  canClose: boolean;
  isCompleted: boolean;
  approvedCount: number;
  totalCount: number;
}

export function CloseProject({
  projectId,
  canClose,
  isCompleted,
  approvedCount,
  totalCount,
}: CloseProjectProps) {
  const [isPending, startTransition] = useTransition();

  if (isCompleted) {
    return (
      <Link
        href={`/dashboard/client/projects/${projectId}`}
        className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1"
      >
        Project completed. View summary & receipt.
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-xs text-zinc-500 max-w-[260px]">
        Closing the project releases the remaining escrow balance to the talent and marks the work as completed.
      </p>
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
        {isPending ? "Closing..." : "Close Project"}
      </Button>
      {!canClose && (
        <p className="text-[11px] text-amber-600">
          You must approve all milestones first ({approvedCount}/{totalCount} approved).
        </p>
      )}
    </div>
  );
}
