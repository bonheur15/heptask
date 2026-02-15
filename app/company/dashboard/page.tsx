import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Users,
  Crown,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCompanyDashboardData } from "./_actions";

export default async function CompanyDashboardPage() {
  const {
    teamMembers,
    invites,
    activeJobs,
    completedJobs,
    assignedJobs,
    autoApply,
  } = await getCompanyDashboardData();

  const activeCount = activeJobs.length;
  const completedCount = completedJobs.length;
  const teamCount = teamMembers.length;
  const pendingInvites = invites.filter((invite) => invite.status === "pending").length;

  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-2xl border border-zinc-200/70 bg-gradient-to-r from-amber-50 via-white to-cyan-50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Operations Hub</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage team capacity, assignment velocity, and enterprise priority intake.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/company/team">Team Management</Link>
            </Button>
            <Button asChild>
              <Link href="/company/priority">Priority Queue</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-50/70 dark:bg-zinc-900/60 border-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Jobs</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/70 dark:bg-zinc-900/60 border-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Team Members</p>
              <p className="text-xl font-bold">{teamCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/70 dark:bg-zinc-900/60 border-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Assigned Jobs</p>
              <p className="text-xl font-bold">{assignedJobs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/70 dark:bg-zinc-900/60 border-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Completed</p>
              <p className="text-xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Board</CardTitle>
              <CardDescription>Current project ownership and execution progress.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedJobs.length > 0 ? (
                    assignedJobs.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="pl-6 font-semibold">{assignment.project.title}</TableCell>
                        <TableCell>{assignment.member?.name ?? "Team member"}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.project.status === "completed" ? "default" : "secondary"}>
                            {assignment.project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                          {formatDistanceToNow(assignment.createdAt, { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                        No assignments yet. Use Team Management to assign project leads.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Momentum</CardTitle>
              <CardDescription>Signals for enterprise queue performance and staffing load.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Auto Apply</p>
                <p className="text-2xl font-bold text-emerald-600">{autoApply?.enabled ? "ON" : "OFF"}</p>
                <p className="text-[11px] text-zinc-500">Priority matching automation.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Pending Invites</p>
                <p className="text-2xl font-bold text-blue-600">{pendingInvites}</p>
                <p className="text-[11px] text-zinc-500">New members awaiting response.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Execution Load</p>
                <p className="text-2xl font-bold text-amber-600">{activeCount}</p>
                <p className="text-[11px] text-zinc-500">Active project workload.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Priority Access
              </CardTitle>
              <CardDescription>Queue and response posture for enterprise projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Status</p>
                <p className="text-lg font-semibold">{autoApply?.enabled ? "Automated Intake Active" : "Manual Review Mode"}</p>
                <p className="text-xs text-zinc-500">
                  {autoApply?.enabled
                    ? "AI is matching your team to qualified projects before the public feed."
                    : "Enable auto-apply in Priority Queue for faster deal flow."}
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/company/priority">Manage Priority Queue</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Capacity</CardTitle>
              <CardDescription>Headcount and throughput at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Active Members</span>
                <span className="font-semibold">{teamCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Pending Invites</span>
                <span className="font-semibold">{pendingInvites}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Active Jobs</span>
                <span className="font-semibold">{activeCount}</span>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/company/team">Review Team</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Ops Tip
            </h4>
            <p className="mt-2 text-xs text-white/70 dark:text-zinc-600">
              Keep assignment allocation visible to reduce delivery bottlenecks and speed up project handoffs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
