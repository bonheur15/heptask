import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Users,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage enterprise delivery, team capacity, and priority access.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Jobs</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Team Members</p>
              <p className="text-xl font-bold">{teamCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Assigned Jobs</p>
              <p className="text-xl font-bold">{assignedJobs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
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
              <CardTitle>Assigned Jobs</CardTitle>
              <CardDescription>Projects distributed across your team.</CardDescription>
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
                        <TableCell className="pl-6 font-semibold">
                          {assignment.project.title}
                        </TableCell>
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
                        No assignments yet. Use the team page to assign work.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Priority Access</CardTitle>
              <CardDescription>Queue status for enterprise projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Auto-Apply</p>
                <p className="text-lg font-semibold">
                  {autoApply?.enabled ? "Enabled" : "Disabled"}
                </p>
                <p className="text-xs text-zinc-500">
                  {autoApply?.enabled
                    ? "AI is matching your team to high-fit projects."
                    : "Turn on auto-apply in the Priority Queue page."}
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/company/priority">Manage Priority Queue</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Capacity</CardTitle>
              <CardDescription>Latest staffing updates.</CardDescription>
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
        </div>
      </div>
    </div>
  );
}
