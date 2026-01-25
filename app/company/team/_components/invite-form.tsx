"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { inviteTeamMember } from "../_actions";

export function InviteForm() {
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
            await inviteTeamMember(formData);
            form.reset();
            toast.success("Invite sent.");
          } catch (error) {
            toast.error("Invite failed.");
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Talent email</label>
          <Input name="email" placeholder="talent@email.com" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Role</label>
          <select
            name="role"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            defaultValue="member"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <Button className="gap-2" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Inviting..." : "Send Invite"}
      </Button>
      <p className="text-[11px] text-zinc-500">
        Team members must be registered as talents to join your company workspace.
      </p>
    </form>
  );
}
