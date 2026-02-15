import { getTalentDashboardData } from "../_actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Wallet,
  Bell,
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/lib/types";

export default async function TalentDashboardPage() {
  const data = await getTalentDashboardData();
  const appliedCount = data.appliedJobs.length;
  const completedCount = data.completedJobs.length;
  const companyAssignmentCount = data.companyAssignments?.length ?? 0;
  const activeBudgetTotal = data.activeJobs.reduce((sum, job) => sum + (Number.parseFloat(job.budget ?? "0") || 0), 0);
  const completedBudgetTotal = data.completedJobs.reduce((sum, job) => sum + (Number.parseFloat(job.budget ?? "0") || 0), 0);

  const talentStats = [
    {
      label: "Active Jobs",
      count: data.activeJobs.length,
      icon: Briefcase,
      color: "text-emerald-600",
    },
    {
      label: "Applications",
      count: appliedCount,
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      count: completedCount,
      icon: CheckCircle2,
      color: "text-violet-600",
    },
    {
      label: "Team Assignments",
      count: companyAssignmentCount,
      icon: Building2,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-2xl border border-zinc-200/70 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Talent Command Center</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Track earnings, delivery health, applications, and team assignments in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/payments">
                <Wallet className="mr-2 h-4 w-4" />
                Balance: {data.escrow.balance} {data.escrow.currency}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/talent/jobs">
                <Search className="mr-2 h-4 w-4" />
                Explore Opportunities
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {talentStats.map((stat) => (
          <Card
            key={stat.label}
            className="overflow-hidden border-none bg-zinc-50/70 dark:bg-zinc-900/60"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold">{stat.count}</p>
                </div>
                <div
                  className={`rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-800 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>Financial and delivery momentum across your active workload.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Active Budget</p>
                <p className="text-2xl font-bold text-emerald-600">${activeBudgetTotal.toFixed(0)}</p>
                <p className="text-[11px] text-zinc-500">Live project value.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Total Completed</p>
                <p className="text-2xl font-bold text-blue-600">${completedBudgetTotal.toFixed(0)}</p>
                <p className="text-[11px] text-zinc-500">Delivered and closed projects.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Completion Rate</p>
                <p className="text-2xl font-bold text-violet-600">{data.stats.completionRate}</p>
                <p className="text-[11px] text-zinc-500">Historical reliability.</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <div className="mb-4 overflow-x-auto">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                <TabsTrigger value="active">Active ({data.activeJobs.length})</TabsTrigger>
                <TabsTrigger value="applied">Applications ({appliedCount})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                <TabsTrigger value="company">Assignments ({companyAssignmentCount})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="mt-0">
              <div className="grid gap-4">
                {data.activeJobs.length > 0 ? (
                  data.activeJobs.map((job: Project) => (
                    <Card
                      key={job.id}
                      className="group hover:border-zinc-400 transition-all"
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" /> ${job.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/talent/work/${job.id}`}>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 text-center">
                    <Briefcase className="h-10 w-10 text-zinc-300 mb-4" />
                    <p className="text-zinc-500 font-medium">No active jobs at the moment.</p>
                    <Button variant="link" asChild>
                      <Link href="/dashboard/talent/jobs">Find your next project</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applied" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6">Project</TableHead>
                        <TableHead>Proposal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.appliedJobs.length > 0 ? (
                        data.appliedJobs.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="pl-6 font-bold">{app.project.title}</TableCell>
                            <TableCell className="max-w-[220px] truncate text-zinc-500">{app.proposal}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  app.status === "accepted"
                                    ? "default"
                                    : app.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {app.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                            You haven&apos;t applied to any jobs yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              <div className="grid gap-4">
                {data.completedJobs.length > 0 ? (
                  data.completedJobs.map((job: Project) => (
                    <Link key={job.id} href={`/dashboard/talent/work/${job.id}`}>
                      <Card className="opacity-85 transition hover:opacity-100 hover:border-zinc-400">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-zinc-500">{job.title}</h4>
                            <p className="text-sm text-zinc-500">Completed on {new Date(job.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="bg-zinc-50 text-zinc-500">ARCHIVED</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-500 border-2 border-dashed rounded-2xl">
                    No completed jobs yet.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="company" className="mt-0">
              <div className="grid gap-4">
                {data.companyAssignments?.length ? (
                  data.companyAssignments.map((assignment) => {
                    const allocation = Number.parseFloat(assignment.allocation ?? "0") || 0;
                    return (
                      <Card key={assignment.id} className="group hover:border-zinc-400 transition-all">
                        <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg">{assignment.project.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                              <span>Company: {assignment.company?.name ?? "Company"}</span>
                              <span>Allocation: ${allocation.toFixed(0)}</span>
                              <span>Status: {assignment.status}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/talent/work/${assignment.projectId}`}>Open</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-zinc-500 border-2 border-dashed rounded-2xl">
                    No team assignments yet.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Radar</CardTitle>
              <CardDescription>Track responsiveness and stay ahead of matching windows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Pending Applications</span>
                <span className="font-semibold">{data.appliedJobs.filter((a) => a.status === "pending").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Accepted Applications</span>
                <span className="font-semibold">{data.appliedJobs.filter((a) => a.status === "accepted").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Recent Notifications</span>
                <span className="font-semibold">{data.notifications.length}</span>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/messages">Open Conversations</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inbox Feed</CardTitle>
              <CardDescription>Latest system and project updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.notifications.length > 0 ? (
                data.notifications.map((item) => (
                  <div key={item.id} className="rounded-xl border p-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">{item.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
                  No notifications yet.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Growth Tip
            </h4>
            <p className="mt-2 text-xs text-white/70 dark:text-zinc-600">
              Increase acceptance rates by attaching milestone-based proposals and clear delivery checkpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
