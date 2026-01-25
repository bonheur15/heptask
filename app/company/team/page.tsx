import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteForm } from "./_components/invite-form";
import { AssignmentForm } from "./_components/assignment-form";
import { getCompanyTeamData } from "./_actions";

export default async function CompanyTeamPage() {
  const { teamMembers, invites, assignedJobs, activeProjects } = await getCompanyTeamData();

  const activeMembers = teamMembers.filter((member) => member.status === "active");
  const pendingInvites = invites.filter((invite) => invite.status === "pending");
  const allocationSummary = assignedJobs.reduce<Record<string, {
    projectId: string;
    title: string;
    budget: number;
    totalAllocation: number;
  }>>((acc, assignment) => {
    const allocation = Number.parseFloat(assignment.allocation ?? "0") || 0;
    const budget = Number.parseFloat(assignment.project.budget ?? "0") || 0;

    if (!acc[assignment.projectId]) {
      acc[assignment.projectId] = {
        projectId: assignment.projectId,
        title: assignment.project.title,
        budget,
        totalAllocation: 0,
      };
    }

    acc[assignment.projectId].totalAllocation += allocation;
    return acc;
  }, {});
  const allocationRows = Object.values(allocationSummary);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Invite talent, set roles, and coordinate project assignments.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/company/dashboard">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Members</p>
              <p className="text-xl font-bold">{activeMembers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pending Invites</p>
              <p className="text-xl font-bold">{pendingInvites.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active Assignments</p>
              <p className="text-xl font-bold">{assignedJobs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Current roster and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="pl-6 font-semibold">{member.member?.name ?? "Talent"}</TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                          {formatDistanceToNow(member.createdAt, { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                        No team members yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Projects currently owned by your team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedJobs.length > 0 ? (
                assignedJobs.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{assignment.project.title}</p>
                      <p className="text-[10px] text-zinc-400">
                        Assigned to {assignment.member?.name ?? "team member"} • Allocation ${assignment.allocation ?? "0"}
                      </p>
                    </div>
                    <Badge variant="secondary">{assignment.project.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No assignments yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>Track team splits against project budgets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {allocationRows.length > 0 ? (
                allocationRows.map((row) => {
                  const isOverAllocated = row.totalAllocation > row.budget && row.budget > 0;
                  const delta = row.totalAllocation - row.budget;
                  return (
                    <div key={row.projectId} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">{row.title}</p>
                        <p className="text-[10px] text-zinc-400">
                          Allocated ${row.totalAllocation.toFixed(0)} of ${row.budget.toFixed(0)}
                        </p>
                      </div>
                      {isOverAllocated ? (
                        <Badge variant="destructive">Over by ${delta.toFixed(0)}</Badge>
                      ) : (
                        <Badge variant="secondary">Within budget</Badge>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-500">No allocation data yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>Track pending and accepted invites.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <div key={invite.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{invite.email}</p>
                      <p className="text-[10px] text-zinc-400">
                        Role {invite.role} • Sent {formatDistanceToNow(invite.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={invite.status === "pending" ? "secondary" : "default"}>
                      {invite.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No invites sent yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite Talent</CardTitle>
              <CardDescription>Bring verified talents into your company workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assign to Project</CardTitle>
              <CardDescription>Track staffing allocations for each project.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentForm
                members={teamMembers.map((member) => ({
                  id: member.memberId,
                  name: member.member?.name ?? "Talent",
                }))}
                projects={activeProjects.map((project) => ({
                  id: project.id,
                  title: project.title,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
