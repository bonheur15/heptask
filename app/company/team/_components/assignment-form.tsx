"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { assignTeamMemberToProject } from "../_actions";

interface MemberOption {
  id: string;
  name: string;
}

interface ProjectOption {
  id: string;
  title: string;
}

interface AssignmentFormProps {
  members: MemberOption[];
  projects: ProjectOption[];
}

export function AssignmentForm({ members, projects }: AssignmentFormProps) {
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
            await assignTeamMemberToProject(formData);
            form.reset();
            toast.success("Team member assigned.");
          } catch (error) {
            toast.error("Assignment failed.");
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Team member</label>
          <select
            name="memberId"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            required
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project</label>
          <select
            name="projectId"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            required
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Budget allocation</label>
        <Input name="allocation" placeholder="5000" />
      </div>
      <Button className="gap-2" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Assigning..." : "Assign to Project"}
      </Button>
      <p className="text-[11px] text-zinc-500">
        Assignments are tracked in Heptadev, execution remains managed off-platform.
      </p>
    </form>
  );
}
