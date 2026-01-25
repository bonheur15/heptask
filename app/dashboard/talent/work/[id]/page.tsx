import Link from "next/link";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectPlan, Milestone, ProjectFile } from "@/lib/types";
import { WorkspaceFileUploader } from "@/components/workspace-file-uploader";
import { DeliveryForm } from "./_components/delivery-form";
import { ChatForm } from "./_components/chat-form";
import { MilestoneActions } from "./_components/milestone-actions";
import {
  getTalentWorkspaceData,
  submitTalentDelivery,
} from "./_actions";

type ActivityItem = {
  id: string;
  label: string;
  time: string;
  status: "info" | "success" | "warning";
  date: Date;
};

export default async function TalentWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, messages, deliveries, sessionUser } = await getTalentWorkspaceData(id);

  const milestones = project.milestones;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === "approved" || m.status === "completed").length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const nextMilestone = milestones.find((m) => m.status === "pending" || m.status === "in_progress");

  const plan = project.plan ? (JSON.parse(project.plan) as ProjectPlan) : null;

  const budget = Number.parseFloat(project.budget ?? "0");
  const estimatedFee = budget * 0.05;
  const now = new Date();
  const timelineBuffer = project.deadline ? differenceInDays(project.deadline, now) : null;
  const overdueCount = milestones.filter((m) => {
    if (!m.dueDate) return false;
    const isComplete = m.status === "approved" || m.status === "completed";
    return !isComplete && m.dueDate < now;
  }).length;
  const qualityScore = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const activityFeed: ActivityItem[] = [
    ...messages.map((msg) => ({
      id: `msg-${msg.id}`,
      label: `${msg.role === "system" ? "System" : msg.sender?.name || "User"} sent a message`,
      time: formatDistanceToNow(msg.createdAt, { addSuffix: true }),
      status: msg.role === "system" ? "success" : "info",
      date: msg.createdAt,
    })),
    ...deliveries.map((delivery) => ({
      id: `delivery-${delivery.id}`,
      label: `Delivery submitted${delivery.milestone ? ` for ${delivery.milestone.title}` : ""}`,
      time: formatDistanceToNow(delivery.createdAt, { addSuffix: true }),
      status: delivery.status === "approved" ? "success" : delivery.status === "revision" ? "warning" : "info",
      date: delivery.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  const statusTone: Record<ActivityItem["status"], string> = {
    info: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };

  const formatDate = (date?: Date | null) => (date ? new Date(date).toLocaleDateString() : "N/A");

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/dashboard/talent" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Active Jobs
            </Link>
            <ArrowRight className="h-3 w-3 text-zinc-300" />
            <span className="text-zinc-900 dark:text-zinc-50">Workspace</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize">
              {project.status}
            </Badge>
            <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
              Talent Workspace
            </Badge>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-3" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Escrow Value</p>
              <p className="text-xl font-bold">${budget.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Deadline</p>
              <p className="text-xl font-bold">{formatDate(project.deadline)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Next Milestone</p>
              <p className="text-sm font-bold">{nextMilestone?.title || "No upcoming milestone"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Progress</p>
              <span className="text-xs font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-zinc-400">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 gap-8">
          <TabsTrigger value="overview" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Milestones ({milestones.length})
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Chat
          </TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Files
          </TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Delivery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Project Brief</CardTitle>
                  <CardDescription>Key project intent and delivery focus.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {plan?.summary || "AI summary will appear once the project plan is finalized."}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(plan?.deliverables || []).slice(0, 4).map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-zinc-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Execution Pulse</CardTitle>
                  <CardDescription>Timeline health, quality signals, and risk.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Quality Score</p>
                    <p className="text-2xl font-bold text-emerald-600">{qualityScore}%</p>
                    <p className="text-[11px] text-zinc-500">Based on completed milestones.</p>
                  </div>
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Timeline Buffer</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {timelineBuffer !== null ? `${timelineBuffer} days` : "N/A"}
                    </p>
                    <p className="text-[11px] text-zinc-500">Time left to deadline.</p>
                  </div>
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Risk Flags</p>
                    <p className="text-2xl font-bold text-amber-600">{overdueCount}</p>
                    <p className="text-[11px] text-zinc-500">Overdue milestones.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <CardHeader>
                  <CardTitle className="text-lg">Escrow Snapshot</CardTitle>
                  <CardDescription className="text-zinc-400 dark:text-zinc-500">
                    Funds secured for this engagement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold">${budget.toFixed(0)}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-70">Locked in escrow</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="opacity-70">Platform fee (5%)</span>
                      <span>${estimatedFee.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span>Projected payout</span>
                      <span>${(budget - estimatedFee).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>Latest actions across the workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityFeed.length > 0 ? (
                    activityFeed.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${statusTone[item.status]}`}>
                          {item.status.toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-[10px] text-zinc-400">{item.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">No recent activity yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Tracker</CardTitle>
              <CardDescription>Breakdown of scope, status, and payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.length > 0 ? (
                milestones.map((m: Milestone, index: number) => {
                  const isApproved = m.status === "approved";
                  const isCompleted = m.status === "completed";
                  const isInProgress = m.status === "in_progress";
                  const statusLabel = isApproved
                    ? "approved"
                    : isCompleted
                      ? "submitted"
                      : isInProgress
                        ? "in progress"
                        : "pending";

                  return (
                    <div key={m.id} className="rounded-2xl border p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-400">Step {index + 1}</p>
                        <h3 className="text-lg font-bold">{m.title}</h3>
                        <p className="text-sm text-zinc-500">{m.description || "No details yet."}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {statusLabel}
                        </Badge>
                        <Badge variant="secondary">{formatDate(m.dueDate)}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Wallet className="h-4 w-4" />
                        ${m.amount || "0"} payout
                      </div>
                      <MilestoneActions
                        projectId={project.id}
                        milestoneId={m.id}
                        disableStart={isApproved || isCompleted || isInProgress}
                        disableSubmit={isApproved || isCompleted}
                      />
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-zinc-500 py-8">
                  No milestones yet. Ask the client to initialize milestones from the plan.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Chat</CardTitle>
              <CardDescription>Keep everything documented for escrow and dispute protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const author = msg.role === "system" ? "System" : msg.sender?.name || "User";
                    return (
                      <div key={msg.id} className={`flex ${msg.role === "talent" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          msg.role === "talent"
                            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                            : msg.role === "system"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
                        }`}>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 mb-2">
                            <span>{author}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(msg.createdAt, { addSuffix: true })}</span>
                          </div>
                          <p className="leading-relaxed">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500">No messages yet.</p>
                )}
              </div>

              <div className="flex items-start gap-3 border-t pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sessionUser.image ?? ""} />
                  <AvatarFallback>{sessionUser.name?.charAt(0) || "T"}</AvatarFallback>
                </Avatar>
                <ChatForm projectId={project.id} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Shared Files</CardTitle>
                <CardDescription>All documents, designs, and notes approved for the workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.files.length > 0 ? (
                  project.files.map((file: ProjectFile) => (
                    <div key={file.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-zinc-400" />
                        <div>
                          <p className="text-sm font-bold">{file.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {file.size || "File"} • {file.uploader?.name || "User"}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={file.url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-zinc-500">
                    No files yet. Upload project assets or a delivery package.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Center</CardTitle>
                <CardDescription>Share assets with the client and auto-tag them to milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkspaceFileUploader
                  projectId={project.id}
                  label="talent"
                  title="Drop files or click to upload"
                  subtitle="PDF, ZIP, PNG, or Figma links"
                />
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 text-xs text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 inline-block mr-2" />
                  Files stay protected under NDA and are visible only to the project team.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Delivery Submission</CardTitle>
                <CardDescription>Submit your work for client approval and milestone release.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {deliveries.length > 0 && (
                  <div className="space-y-3">
                    {deliveries.map((delivery) => (
                      <div key={delivery.id} className="rounded-xl border p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>Submitted {formatDistanceToNow(delivery.createdAt, { addSuffix: true })}</span>
                          <Badge variant={delivery.status === "approved" ? "default" : delivery.status === "revision" ? "secondary" : "outline"}>
                            {delivery.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{delivery.summary}</p>
                        {delivery.link && (
                          <a className="text-xs text-blue-600 underline" href={delivery.link} target="_blank" rel="noreferrer">
                            View delivery link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <DeliveryForm
                  projectId={project.id}
                  milestones={milestones.map((milestone) => ({ id: milestone.id, title: milestone.title }))}
                  action={submitTalentDelivery}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Approval Checklist</CardTitle>
                <CardDescription>Use this to reduce revision cycles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Scope matches project plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Assets are organized and labeled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Handoff instructions included</span>
                </div>
                <div className="rounded-xl border p-4 text-[11px] text-zinc-500">
                  Share a walkthrough to speed approvals and escrow release.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
