import { getClientDashboardData } from "../_actions";
import { ProjectCard } from "./_components/project-card";
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
  Plus,
  Wallet,
  Bell,
  AlertTriangle,
  MessageSquare,
  ArrowUpRight,
  LayoutGrid,
  ListTodo,
  Settings2,
  HelpCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ClientDashboardPage() {
  const data = await getClientDashboardData();
  const latestPaymentStatusByProject = new Map<string, string>();
  for (const payment of data.publicationPayments) {
    if (!payment.projectId) continue;
    if (!latestPaymentStatusByProject.has(payment.projectId)) {
      latestPaymentStatusByProject.set(payment.projectId, payment.status);
    }
  }

  const projectStats = [
    {
      label: "Active",
      count: data.projects.active.length,
      icon: LayoutGrid,
      color: "text-emerald-600",
    },
    {
      label: "Drafts",
      count: data.projects.draft.length,
      icon: ListTodo,
      color: "text-zinc-500",
    },
    {
      label: "Maintenance",
      count: data.projects.maintenance.length,
      icon: Settings2,
      color: "text-amber-600",
    },
    {
      label: "Completed",
      count: data.projects.completed.length,
      icon: HelpCircle,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Client Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your projects, payments, and communications.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/payments">
              <Wallet className="mr-2 h-4 w-4" />
              Escrow: {data.escrow.balance} {data.escrow.currency}
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Link href="/dashboard/client/projects/create">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectStats.map((stat) => (
          <Card
            key={stat.label}
            className="overflow-hidden border-none bg-zinc-50/50 dark:bg-zinc-900/50"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label} Projects
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
        {/* Main Project Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              <Link
                href="/dashboard/projects"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
              >
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <TabsContent value="active" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {data.projects.active.length > 0 ? (
                  data.projects.active.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      publicationPaymentStatus={latestPaymentStatusByProject.get(project.id)}
                    />
                  ))
                ) : (
                  <div className="sm:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10">
                    <p className="text-zinc-500">No active projects yet.</p>
                    <Button variant="link" asChild>
                      <Link href="/dashboard/client/projects/create">
                        Create your first project
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {data.projects.draft.length > 0 ? (
                  data.projects.draft.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      publicationPaymentStatus={latestPaymentStatusByProject.get(project.id)}
                    />
                  ))
                ) : (
                  <div className="sm:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl">
                    <p className="text-zinc-500">No draft projects.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {data.projects.maintenance.length > 0 ? (
                  data.projects.maintenance.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      publicationPaymentStatus={latestPaymentStatusByProject.get(project.id)}
                    />
                  ))
                ) : (
                  <div className="sm:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl">
                    <p className="text-zinc-500">No projects in maintenance.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions / Messages Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Stay in touch with your talents.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/messages">Open Inbox</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-8 w-8 text-zinc-200 mb-2" />
                <p className="text-sm text-zinc-500">
                  No recent messages to display.
                </p>
              </div>
            </CardContent>
          </Card>
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

          {/* Disputes Widget */}
          <Card className="border-red-100 dark:border-red-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.disputes.length > 0 ? (
                  data.disputes.map((dispute) => (
                    <div key={dispute.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">
                          {dispute.project?.title}
                        </p>
                        <Badge
                          variant="destructive"
                          className="text-[10px] h-4"
                        >
                          OPEN
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500">{dispute.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No active disputes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Tip */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Pro Tip
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Enable maintenance plans after project completion to get priority
              support and bug fixes for your software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
