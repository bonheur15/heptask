"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { releaseMilestone } from "../_actions";

interface MilestoneItem {
  id: string;
  title: string;
  status: string;
  amount: string | null;
}

interface ProjectMilestones {
  id: string;
  title: string;
  milestones: MilestoneItem[];
}

interface MilestoneReleaseListProps {
  projects: ProjectMilestones[];
}

export function MilestoneReleaseList({ projects }: MilestoneReleaseListProps) {
  const [isPending, startTransition] = useTransition();

  if (projects.length === 0) {
    return <p className="text-sm text-zinc-500">No projects available.</p>;
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="rounded-2xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{project.title}</h4>
            <span className="text-[10px] text-zinc-400">
              {project.milestones.length} milestones
            </span>
          </div>
          <div className="space-y-2">
            {project.milestones.map((milestone) => {
              const canRelease = milestone.status === "completed";
              return (
                <div key={milestone.id} className="flex items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-[10px] text-zinc-400 capitalize">{milestone.status.replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">${milestone.amount ?? "0"}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canRelease || isPending}
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("projectId", project.id);
                        formData.set("milestoneId", milestone.id);
                        startTransition(async () => {
                          try {
                            await releaseMilestone(formData);
                            toast.success("Milestone released.");
                          } catch (error) {
                            toast.error("Milestone release failed.");
                          }
                        });
                      }}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Release"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
