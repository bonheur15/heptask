import { auth } from "@/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderUp,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectPlan, Milestone, ProjectFile } from "@/lib/types";

type WorkspaceMessage = {
  id: string;
  author: string;
  role: "client" | "talent" | "system";
  time: string;
  message: string;
};

type ApprovalQueueItem = {
  id: string;
  title: string;
  status: "pending" | "in_review" | "approved";
  due: string;
};

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const workspaceProject = await db.query.project.findFirst({
    where: eq(project.id, id),
    with: {
      milestones: true,
      files: {
        with: {
          uploader: true,
        },
      },
      client: true,
      talent: true,
    },
  });

  if (!workspaceProject || workspaceProject.clientId !== session.user.id) {
    notFound();
  }

  const milestones = workspaceProject.milestones;
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter((m) => m.status === "approved").length;
  const progress = totalMilestones > 0 ? Math.round((approvedMilestones / totalMilestones) * 100) : 0;
  const pendingApprovals = milestones.filter((m) => m.status === "completed" || m.status === "in_progress").length;

  const plan = workspaceProject.plan
    ? (JSON.parse(workspaceProject.plan) as ProjectPlan)
    : null;

  const budget = Number.parseFloat(workspaceProject.budget ?? "0");
  const escrowReleased = budget * (approvedMilestones / Math.max(totalMilestones, 1));
  const escrowRemaining = Math.max(budget - escrowReleased, 0);

  const messages: WorkspaceMessage[] = [
    {
      id: "msg-1",
      author: "You",
      role: "client",
      time: "2h ago",
      message: "Confirming the kickoff call for tomorrow. Please share any early wireframes.",
    },
    {
      id: "msg-2",
      author: workspaceProject.talent?.name || "Talent",
      role: "talent",
      time: "90m ago",
      message: "Great. I will upload the first UI draft and a timeline after the call.",
    },
    {
      id: "msg-3",
      author: "System",
      role: "system",
      time: "45m ago",
      message: "Milestone 1 marked as in progress. Escrow funds are locked and ready.",
    },
  ];

  const approvalQueue: ApprovalQueueItem[] = milestones.map((m) => ({
    id: m.id,
    title: m.title,
    status: m.status === "approved" ? "approved" : m.status === "completed" ? "in_review" : "pending",
    due: m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "N/A",
  }));

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
            <h1 className="text-3xl font-bold tracking-tight">{workspaceProject.title}</h1>
            <Badge variant={workspaceProject.status === "active" ? "default" : "secondary"} className="capitalize">
              {workspaceProject.status}
            </Badge>
            <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
              Client Workspace
            </Badge>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">{workspaceProject.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" /> Message Talent
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <ShieldAlert className="h-4 w-4" /> Open Dispute
          </Button>
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
              <p className="text-xl font-bold">{formatDate(workspaceProject.deadline)}</p>
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
                    <p className="text-2xl font-bold text-emerald-600">On Track</p>
                    <p className="text-[11px] text-zinc-500">2 milestones ahead.</p>
                  </div>
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Comm Health</p>
                    <p className="text-2xl font-bold text-blue-600">High</p>
                    <p className="text-[11px] text-zinc-500">Avg response: 1h.</p>
                  </div>
                  <div className="rounded-xl border p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">Risk Flags</p>
                    <p className="text-2xl font-bold text-amber-600">1</p>
                    <p className="text-[11px] text-zinc-500">Awaiting assets.</p>
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
                  {approvalQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-[10px] text-zinc-400">Due {item.due}</p>
                      </div>
                      <Badge variant={item.status === "approved" ? "default" : item.status === "in_review" ? "secondary" : "outline"}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
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
                milestones.map((m: Milestone, index: number) => (
                  <div key={m.id} className="rounded-2xl border p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-400">Step {index + 1}</p>
                        <h3 className="text-lg font-bold">{m.title}</h3>
                        <p className="text-sm text-zinc-500">{m.description || "No details yet."}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {m.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary">{formatDate(m.dueDate)}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Wallet className="h-4 w-4" />
                        ${m.amount || "0"} payout
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">Request Revision</Button>
                        <Button size="sm">Approve & Release</Button>
                      </div>
                    </div>
                  </div>
                ))
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
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === "client"
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : msg.role === "system"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
                    }`}>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 mb-2">
                        <span>{msg.author}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 border-t pt-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback>{session.user.name?.charAt(0) || "C"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea placeholder="Share feedback, approvals, or blockers..." className="min-h-[100px]" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="gap-2">
                      Send Update <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      Attach File <FolderUp className="h-4 w-4" />
                    </Button>
                    <span className="text-[10px] text-zinc-400">
                      Chats are AI-scanned for risk and safety.
                    </span>
                  </div>
                </div>
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
                {workspaceProject.files.length > 0 ? (
                  workspaceProject.files.map((file: ProjectFile) => (
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
                      <Button size="sm" variant="outline">View</Button>
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
                <div className="rounded-2xl border border-dashed p-6 text-center">
                  <FolderUp className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
                  <p className="text-sm font-medium">Drop files to upload</p>
                  <p className="text-[10px] text-zinc-400">PDF, DOCX, audio, or design files</p>
                </div>
                <Input type="file" />
                <Button className="w-full gap-2">
                  Upload Files <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 text-xs text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4 inline-block mr-2 text-amber-500" />
                  AI automatically tags your uploads to the correct milestone.
                </div>
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
                <Textarea
                  placeholder="Leave approval notes, feedback, or change requests."
                  className="min-h-[160px]"
                />
                <Input placeholder="Attach approval notes or revision links" />
                <div className="flex flex-wrap items-center gap-3">
                  <Button className="gap-2">
                    Approve Work <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">Request Revision</Button>
                </div>
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
                  <Clock className="h-4 w-4 inline-block mr-2 text-amber-500" />
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
