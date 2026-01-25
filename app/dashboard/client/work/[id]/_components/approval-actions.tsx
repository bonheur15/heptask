"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updateClientMilestoneStatus, reviewDelivery } from "../_actions";

interface ApprovalActionsProps {
  projectId: string;
  milestoneId: string;
  canReview: boolean;
}

export function ApprovalActions({ projectId, milestoneId, canReview }: ApprovalActionsProps) {
  const [isPending, startTransition] = useTransition();

  const submitStatus = (status: "approved" | "in_progress") => {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("milestoneId", milestoneId);
    formData.set("status", status);
    startTransition(async () => {
      try {
        await updateClientMilestoneStatus(formData);
        toast.success(status === "approved" ? "Milestone approved and released." : "Revision requested.");
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
        disabled={!canReview || isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Revision"}
      </Button>
      <Button size="sm" onClick={() => submitStatus("approved")} disabled={!canReview || isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Release"}
      </Button>
    </div>
  );
}

interface DeliveryActionsProps {
  projectId: string;
  deliveryId: string;
  status: "pending" | "approved" | "revision";
}

export function DeliveryActions({ projectId, deliveryId, status }: DeliveryActionsProps) {
  const [isPending, startTransition] = useTransition();

  const submitDecision = (decision: "approve" | "revision") => {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("deliveryId", deliveryId);
    formData.set("decision", decision);
    startTransition(async () => {
      try {
        await reviewDelivery(formData);
        toast.success(decision === "approve" ? "Delivery approved." : "Revision requested.");
      } catch (error) {
        toast.error("Delivery update failed.");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => submitDecision("revision")}
        disabled={status === "revision" || isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Revision"}
      </Button>
      <Button size="sm" onClick={() => submitDecision("approve")} disabled={status === "approved" || isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve Delivery"}
      </Button>
    </div>
  );
}
