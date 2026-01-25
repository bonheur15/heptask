import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoApplyForm } from "./_components/auto-apply-form";
import { PriorityInterestButton } from "./_components/priority-interest-button";
import { getCompanyPriorityData } from "./_actions";

export default async function CompanyPriorityPage() {
  const { priorityProjects, autoApply, interests } = await getCompanyPriorityData();

  const enabled = autoApply?.enabled ?? false;
  const focusSkills = autoApply?.focusSkills ?? null;
  const minBudget = autoApply?.minBudget ?? null;
  const appliedProjects = new Set(interests.map((interest) => interest.projectId));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Priority Queue</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Early access projects curated for enterprise delivery teams.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/company/dashboard">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Early Access Projects</CardTitle>
            <CardDescription>Projects available before public release.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityProjects.length > 0 ? (
              priorityProjects.map((project) => (
                <div key={project.id} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{project.title}</p>
                      <p className="text-[10px] text-zinc-400">
                        Posted {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="secondary">Priority Access</Badge>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5" /> Budget ${project.budget ?? "0"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Deadline {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/talent/jobs/${project.id}`}>View Details</Link>
                    </Button>
                    <PriorityInterestButton
                      projectId={project.id}
                      isApplied={appliedProjects.has(project.id)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No priority projects available yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Apply System</CardTitle>
              <CardDescription>Let Heptadev reserve best-fit projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoApplyForm enabled={enabled} focusSkills={focusSkills} minBudget={minBudget} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queue Insights</CardTitle>
              <CardDescription>Signals for enterprise selection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Priority projects</span>
                <span className="font-semibold">{priorityProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Auto-apply status</span>
                <span className="font-semibold">{enabled ? "On" : "Off"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Focus skills</span>
                <span className="font-semibold">{focusSkills || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Requests sent</span>
                <span className="font-semibold">{interests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
