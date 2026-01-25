import Link from "next/link";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
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
import {
  getClientWorkspaceData,
} from "./_actions";
import { ChatForm } from "./_components/chat-form";
import { ApprovalActions, DeliveryActions } from "./_components/approval-actions";
import { CloseProject } from "./_components/close-project";

type ApprovalQueueItem = {
  id: string;
  title: string;
  status: "pending" | "in_review" | "approved";
  due: string;
  date: Date;
};

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, messages, deliveries, sessionUser } = await getClientWorkspaceData(id);

  const milestones = project.milestones;
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter((m) => m.status === "approved").length;
  const canCloseProject = milestones.length > 0 && approvedMilestones === milestones.length;
  const progress = totalMilestones > 0 ? Math.round((approvedMilestones / totalMilestones) * 100) : 0;
  const pendingApprovals = milestones.filter((m) => m.status === "completed" || m.status === "in_progress").length;

  const plan = project.plan ? (JSON.parse(project.plan) as ProjectPlan) : null;
  const budget = Number.parseFloat(project.budget ?? "0");
  const escrowReleased = budget * (approvedMilestones / Math.max(totalMilestones, 1));
  const escrowRemaining = Math.max(budget - escrowReleased, 0);

  const now = new Date();
  const totalDuration = project.deadline ? differenceInDays(project.deadline, project.createdAt) : null;
  const elapsedDuration = differenceInDays(now, project.createdAt);
  const expectedProgress = totalDuration && totalDuration > 0 ? Math.min((elapsedDuration / totalDuration) * 100, 100) : null;
  const velocityLabel = expectedProgress !== null
    ? progress >= expectedProgress
      ? "On Track"
      : "At Risk"
    : "Pending";

  const recentTalentMessages = messages.filter((msg) => msg.role === "talent").length;
  const commHealth = recentTalentMessages > 3 ? "High" : recentTalentMessages > 0 ? "Moderate" : "Low";

  const overdueCount = milestones.filter((m) => {
    if (!m.dueDate) return false;
    return m.dueDate < now && m.status !== "approved";
  }).length;

  const approvalQueue: ApprovalQueueItem[] = milestones.map((m) => ({
    id: m.id,
    title: m.title,
    status: m.status === "approved" ? "approved" : m.status === "completed" ? "in_review" : "pending",
    due: m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A",
    date: m.dueDate ?? m.createdAt,
  }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  const formatDate = (date?: Date | null) => (date ? new Date(date).toLocaleDateString() : "N/A");

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/dashboard/client" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Client Dashboard
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
              Client Workspace
            </Badge>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CloseProject projectId={project.id} canClose={canCloseProject} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Escrow Remaining</p>
              <p className="text-xl font-bold">${escrowRemaining.toFixed(0)}</p>
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
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pending Approvals</p>
              <p className="text-xl font-bold">{pendingApprovals}</p>
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
              {approvedMilestones} of {totalMilestones} milestones approved
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
          <TabsTrigger value="approvals" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Focus</CardTitle>
                  <CardDescription>AI brief and expected outcomes.</CardDescription>
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
                  <CardTitle>Talent Performance</CardTitle>
                  <CardDescription>Collaboration and delivery insights.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Velocity</p>
                    <p className="text-2xl font-bold text-emerald-600">{velocityLabel}</p>
                    <p className="text-[11px] text-zinc-500">Progress vs timeline.</p>
                  </div>
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Comm Health</p>
                    <p className="text-2xl font-bold text-blue-600">{commHealth}</p>
                    <p className="text-[11px] text-zinc-500">Message cadence.</p>
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
                  <CardTitle className="text-lg">Escrow Timeline</CardTitle>
                  <CardDescription className="text-zinc-400 dark:text-zinc-500">
                    Release guardrails and balances.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold">${escrowRemaining.toFixed(0)}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-70">Remaining in escrow</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="opacity-70">Released so far</span>
                      <span>${escrowReleased.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="opacity-70">Manual release limit</span>
                      <span>50% cap</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Queue</CardTitle>
                  <CardDescription>Milestones waiting on review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {approvalQueue.length > 0 ? (
                    approvalQueue.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-[10px] text-zinc-400">Due {item.due}</p>
                        </div>
                        <Badge variant={item.status === "approved" ? "default" : item.status === "in_review" ? "secondary" : "outline"}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">No milestones yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Approval</CardTitle>
              <CardDescription>Approve work and release escrow securely.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.length > 0 ? (
                milestones.map((m: Milestone, index: number) => {
                  const isApproved = m.status === "approved";
                  const isAwaitingReview = m.status === "completed";
                  const statusLabel = isApproved
                    ? "approved"
                    : isAwaitingReview
                      ? "awaiting review"
                      : "in progress";

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
                      <ApprovalActions
                        projectId={project.id}
                        milestoneId={m.id}
                        canReview={isAwaitingReview}
                      />
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-zinc-500 py-8">
                  No milestones yet. Generate a plan to begin approvals.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Chat</CardTitle>
              <CardDescription>Everything here is stored for dispute resolution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const author = msg.role === "system" ? "System" : msg.sender?.name || "User";
                    return (
                      <div key={msg.id} className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          msg.role === "client"
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
                  <AvatarFallback>{sessionUser.name?.charAt(0) || "C"}</AvatarFallback>
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
                <CardTitle>Project Files</CardTitle>
                <CardDescription>All approved project documents and deliverables.</CardDescription>
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
                    No files yet. Upload scope documents or feedback.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Center</CardTitle>
                <CardDescription>Share files and link them to milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkspaceFileUploader
                  projectId={project.id}
                  label="client"
                  title="Drop files or click to upload"
                  subtitle="PDF, DOCX, audio, or design files"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Approval Center</CardTitle>
                <CardDescription>Review deliveries and release funds securely.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveries.length > 0 ? (
                  deliveries.map((delivery) => (
                    <div key={delivery.id} className="rounded-2xl border p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Submitted {formatDistanceToNow(delivery.createdAt, { addSuffix: true })}</span>
                        <Badge variant={delivery.status === "approved" ? "default" : delivery.status === "revision" ? "secondary" : "outline"}>
                          {delivery.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{delivery.summary}</p>
                        {delivery.link && (
                          <a className="text-xs text-blue-600 underline" href={delivery.link} target="_blank" rel="noreferrer">
                            View delivery link
                          </a>
                        )}
                        {delivery.file?.url && (
                          <a className="text-xs text-blue-600 underline" href={delivery.file.url} target="_blank" rel="noreferrer">
                            Download attached file
                          </a>
                        )}
                      </div>
                      <DeliveryActions
                        projectId={project.id}
                        deliveryId={delivery.id}
                        status={
                          delivery.status === "approved"
                            ? "approved"
                            : delivery.status === "revision"
                              ? "revision"
                              : "pending"
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-zinc-500">
                    No deliveries yet. Reviews will appear here once submitted.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Checklist</CardTitle>
                <CardDescription>Use this before releasing funds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Deliverables match agreed scope</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Files are organized and versioned</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Communication and handoff complete</span>
                </div>
                <div className="rounded-xl border p-4 text-[11px] text-zinc-500">
                  Approvals trigger automatic escrow release within 24 hours.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
