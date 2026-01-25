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
} from "lucide-react";
import { formatDistanceToNow, isValid } from "date-fns";
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
  const activeBudgetTotal = data.activeJobs.reduce((sum, job) => sum + (Number.parseFloat(job.budget ?? "0") || 0), 0);
  const completedBudgetTotal = data.completedJobs.reduce((sum, job) => sum + (Number.parseFloat(job.budget ?? "0") || 0), 0);
  const upcomingDeadlines = data.activeJobs
    .filter((job) => job.deadline)
    .sort((a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 3);
  const applicationStats = data.appliedJobs.reduce(
    (acc, app) => {
      if (app.status === "accepted") acc.accepted += 1;
      if (app.status === "rejected") acc.rejected += 1;
      if (app.status === "pending") acc.pending += 1;
      return acc;
    },
    { accepted: 0, rejected: 0, pending: 0 },
  );

  const talentStats = [
    {
      label: "Active Jobs",
      count: data.activeJobs.length,
      icon: Briefcase,
      color: "text-emerald-600",
    },
    {
      label: "Applied",
      count: appliedCount,
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: "Total Jobs",
      count: data.stats.totalJobs,
      icon: CheckCircle2,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      count: completedCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Talent Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Track your earnings, manage jobs, and find new opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/payments">
              <Wallet className="mr-2 h-4 w-4" />
              Earnings: {data.escrow.balance} {data.escrow.currency}
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Link href="/dashboard/talent/jobs">
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {talentStats.map((stat) => (
          <Card
            key={stat.label}
            className="overflow-hidden border-none bg-zinc-50/50 dark:bg-zinc-900/50"
          >
            <CardContent className="p-6">
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
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
              <CardDescription>Current earnings, workload, and progress highlights.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Active Budget</p>
                <p className="text-2xl font-bold text-emerald-600">${activeBudgetTotal.toFixed(0)}</p>
                <p className="text-[11px] text-zinc-500">Across active projects.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Lifetime Earned</p>
                <p className="text-2xl font-bold text-blue-600">${completedBudgetTotal.toFixed(0)}</p>
                <p className="text-[11px] text-zinc-500">From completed jobs.</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-500">{data.stats.completionRate}</p>
                <p className="text-[11px] text-zinc-500">Closed engagements.</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                <TabsTrigger value="active">Active Jobs ({data.activeJobs.length})</TabsTrigger>
                <TabsTrigger value="applied">Applications ({appliedCount})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
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
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" /> Budget: $
                              {job.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> Due:{" "}
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString()
                                : "N/A"}
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
                    <p className="text-zinc-500 font-medium">
                      No active jobs at the moment.
                    </p>
                    <Button variant="link" asChild>
                      <Link href="/dashboard/talent/jobs">
                        Find your next project
                      </Link>
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
                        <TableHead>Your Proposal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">
                          Applied
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.appliedJobs.length > 0 ? (
                        data.appliedJobs.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="pl-6 font-bold">
                              {app.project.title}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-zinc-500">
                              {app.proposal}
                            </TableCell>
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
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-zinc-500"
                          >
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
                      <Card className="opacity-80 transition hover:opacity-100 hover:border-zinc-400">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-zinc-500">
                              {job.title}
                            </h4>
                            <p className="text-sm text-zinc-500">
                              Completed on{" "}
                              {new Date(job.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-zinc-50 text-zinc-500"
                            >
                              ARCHIVED
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-500 border-2 border-dashed rounded-2xl">
                    No completed jobs yet. Keep up the great work!
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((job) => {
                  const deadline = job.deadline ? new Date(job.deadline) : null;
                  const label = deadline && isValid(deadline)
                    ? formatDistanceToNow(deadline, { addSuffix: true })
                    : "No deadline";
                  return (
                    <div key={job.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                      <div>
                        <p className="text-sm font-semibold">{job.title}</p>
                        <p className="text-[10px] text-zinc-500">{label}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/talent/work/${job.id}`}>Open</Link>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-500">No upcoming deadlines.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Applications Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Pending</span>
                <span className="font-semibold">{applicationStats.pending}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Accepted</span>
                <span className="font-semibold text-emerald-600">{applicationStats.accepted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Rejected</span>
                <span className="font-semibold text-amber-600">{applicationStats.rejected}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
              <Bell className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.notifications.length > 0 ? (
                  data.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-semibold">{notif.title}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No new notifications.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-xs h-8" asChild>
                <Link href="/dashboard/talent/jobs">Browse new jobs</Link>
              </Button>
              <Button variant="outline" className="w-full text-xs h-8" asChild>
                <Link href="/dashboard/profile">Update profile</Link>
              </Button>
              <Button variant="outline" className="w-full text-xs h-8" asChild>
                <Link href="/dashboard/messages">Open messages</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
