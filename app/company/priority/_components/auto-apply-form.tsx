"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { saveAutoApplySettings } from "../_actions";

interface AutoApplyFormProps {
  enabled: boolean;
  focusSkills?: string | null;
  minBudget?: string | null;
}

export function AutoApplyForm({ enabled, focusSkills, minBudget }: AutoApplyFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          try {
            await saveAutoApplySettings(formData);
            toast.success("Auto-apply settings saved.");
          } catch (error) {
            toast.error("Auto-apply update failed.");
          }
        });
      }}
    >
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Focus skills</label>
          <Input name="focusSkills" defaultValue={focusSkills ?? ""} placeholder="Fintech, React, UX" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Minimum budget</label>
          <Input name="minBudget" defaultValue={minBudget ?? ""} placeholder="5000" />
        </div>
      </div>
      <Button className="gap-2" disabled={isPending} type="submit" variant="outline">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Saving..." : enabled ? "Disable Auto-Apply" : "Enable Auto-Apply"}
      </Button>
      <p className="text-[11px] text-zinc-500">
        Auto-apply can reserve high-fit projects and notify your team instantly.
      </p>
    </form>
  );
}
