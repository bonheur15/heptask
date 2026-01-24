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
  Star,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  DollarSign,
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

export default async function TalentDashboardPage() {
  const data = await getTalentDashboardData();

  const talentStats = [
    {
      label: "Active Jobs",
      count: data.activeJobs.length,
      icon: Briefcase,
      color: "text-emerald-600",
    },
    {
      label: "Rating",
      count: data.stats.rating,
      icon: Star,
      color: "text-amber-500",
    },
    {
      label: "Total Jobs",
      count: data.stats.totalJobs,
      icon: CheckCircle2,
      color: "text-blue-600",
    },
    {
      label: "Success Rate",
      count: data.stats.completionRate,
      icon: ArrowUpRight,
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
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="applied">Applications</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="mt-0">
              <div className="grid gap-4">
                {data.activeJobs.length > 0 ? (
                  data.activeJobs.map((job) => (
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
                            You haven't applied to any jobs yet.
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
                  data.completedJobs.map((job) => (
                    <Card key={job.id} className="opacity-80">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg line-through text-zinc-400">
                            {job.title}
                          </h4>
                          <p className="text-sm text-zinc-500">
                            Completed on{" "}
                            {new Date(job.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-zinc-50 text-zinc-500"
                        >
                          ARCHIVED
                        </Badge>
                      </CardContent>
                    </Card>
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

          {/* Quick Support / Message Widget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" /> Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Have questions about a project or payment? Our AI support is
                available 24/7.
              </p>
              <Button variant="outline" className="w-full text-xs h-8">
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Platform Tip */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Pro Tip
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Complete your profile with your best skills and portfolio to
              increase your chances of being hired by 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
