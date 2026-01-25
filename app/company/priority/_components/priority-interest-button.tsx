"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { expressPriorityInterest } from "../_actions";

type PriorityInterestButtonProps = {
  projectId: string;
  isApplied: boolean;
};

export function PriorityInterestButton({ projectId, isApplied }: PriorityInterestButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          try {
            await expressPriorityInterest(formData);
            toast.success("Priority request submitted.");
          } catch (_error) {
            toast.error("Priority request failed.");
          }
        });
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Button size="sm" disabled={isApplied || isPending} variant={isApplied ? "secondary" : "default"}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {isApplied ? "Applied" : isPending ? "Applying..." : "Request Priority"}
      </Button>
    </form>
  );
}
