"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { startAccountUpgradeCheckout } from "../_actions";

export function UpgradeButton({
  tier,
  disabled,
}: {
  tier: "pro" | "enterprise";
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await startAccountUpgradeCheckout(tier);
            if (result.checkoutUrl) {
              toast.success("Redirecting to secure checkout...");
              window.location.assign(result.checkoutUrl);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to start checkout");
          }
        });
      }}
      className="w-full"
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isPending ? "Preparing..." : `Upgrade to ${tier[0].toUpperCase()}${tier.slice(1)}`}
    </Button>
  );
}
