"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import { sendTalentMessage } from "../_actions";

interface ChatFormProps {
  projectId: string;
}

export function ChatForm({ projectId }: ChatFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex-1 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          try {
            await sendTalentMessage(formData);
            form.reset();
            toast.success("Update sent to client.");
          } catch (error) {
            toast.error("Message failed to send.");
          }
        });
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea name="message" placeholder="Send an update, ask for approval, or flag a risk..." className="min-h-[100px]" required />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="gap-2" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {isPending ? "Sending..." : "Send Update"}
        </Button>
        <span className="text-[10px] text-zinc-400">
          All messages are logged for dispute resolution.
        </span>
      </div>
    </form>
  );
}
