"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { payAndPublishProject } from "../_actions";

export function PayAndPublishButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      className="gap-2"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await payAndPublishProject(projectId);
            if (result.checkoutUrl) {
              toast.success("Redirecting to Flutterwave checkout...");
              window.location.assign(result.checkoutUrl);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not start payment.");
          }
        });
      }}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {isPending ? "Starting..." : "Pay & Publish"}
    </Button>
  );
}
