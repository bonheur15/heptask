"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import { sendClientMessage } from "../_actions";

interface ChatFormProps {
  projectId: string;
  disabled?: boolean;
}

export function ChatForm({ projectId, disabled }: ChatFormProps) {
  const [isPending, startTransition] = useTransition();

  if (disabled) {
    return (
      <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Chat is read-only because this project is completed.
      </div>
    );
  }

  return (
    <form
      className="flex-1 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          try {
            await sendClientMessage(formData);
            form.reset();
            toast.success("Update sent to talent.");
          } catch (error) {
            toast.error("Message failed to send.");
          }
        });
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea name="message" placeholder="Share feedback, approvals, or blockers..." className="min-h-[100px]" required />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="gap-2" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {isPending ? "Sending..." : "Send Update"}
        </Button>
        <span className="text-[10px] text-zinc-400">
          Chats are AI-scanned for risk and safety.
        </span>
      </div>
    </form>
  );
}
