"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Bot,
  Brain,
  ExternalLink,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_MODELS, AiModelId } from "@/lib/ai/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  convertAnalysisToProject,
  createAnalysisSession,
  getAnalysisWorkspaceData,
  sendAnalysisMessage,
  updateAnalysisSessionDraft,
} from "../_actions";

type WorkspaceData = Awaited<ReturnType<typeof getAnalysisWorkspaceData>>;
type ToolMode = "scope" | "technical" | "budget" | "timeline" | "risks" | "references";
type SessionMode = "fast" | "advanced";

const TOOL_LABELS: Record<ToolMode, string> = {
  scope: "Scope",
  technical: "Technical",
  budget: "Budget",
  timeline: "Timeline",
  risks: "Risks",
  references: "References",
};

export function AnalysisWorkspace({ initialData }: { initialData: WorkspaceData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [activeTool, setActiveTool] = useState<ToolMode>("scope");
  const [message, setMessage] = useState("");
  const [sessionTitle, setSessionTitle] = useState(data.activeSession?.draftTitle || data.activeSession?.title || "");
  const [objective, setObjective] = useState(data.activeSession?.objective || "");
  const [budget, setBudget] = useState(data.activeSession?.draftBudget || "");
  const [deadline, setDeadline] = useState(
    data.activeSession?.draftDeadline
      ? new Date(data.activeSession.draftDeadline).toISOString().slice(0, 10)
      : "",
  );
  const [mode, setMode] = useState<SessionMode>((data.activeSession?.mode as SessionMode) || "advanced");
  const [modelId, setModelId] = useState<AiModelId>((data.activeSession?.modelId as AiModelId) || "gemini-2.5-flash-lite-preview-09-2025");

  const toolAllowed = useMemo(() => data.limits.tools.includes(activeTool), [data.limits.tools, activeTool]);
  const canConvert = Boolean(
    data.activeSession
    && (sessionTitle || data.activeSession.draftTitle || data.activeSession.title)
    && (objective || data.activeSession.draftDescription || data.activeSession.objective)
    && (budget || data.activeSession.draftBudget),
  );

  const sync = async (sessionId?: string) => {
    const fresh = await getAnalysisWorkspaceData(sessionId);
    setData(fresh);
    setSessionTitle(fresh.activeSession?.draftTitle || fresh.activeSession?.title || "");
    setObjective(fresh.activeSession?.objective || fresh.activeSession?.draftDescription || "");
    setBudget(fresh.activeSession?.draftBudget || "");
    setDeadline(
      fresh.activeSession?.draftDeadline
        ? new Date(fresh.activeSession.draftDeadline).toISOString().slice(0, 10)
        : "",
    );
    setMode((fresh.activeSession?.mode as SessionMode) || "advanced");
    setModelId((fresh.activeSession?.modelId as AiModelId) || "gemini-2.5-flash-lite-preview-09-2025");
  };

  const onCreateSession = () => {
    startTransition(async () => {
      try {
        const created = await createAnalysisSession({
          title: "New project analysis",
          mode,
          modelId,
        });
        await sync(created.sessionId);
        router.replace(`/dashboard/client/analysis?session=${created.sessionId}`);
        toast.success("Analysis session created.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create session.");
      }
    });
  };

  const onOpenSession = (sessionId: string) => {
    startTransition(async () => {
      await sync(sessionId);
      router.replace(`/dashboard/client/analysis?session=${sessionId}`);
    });
  };

  const onSend = () => {
    if (!data.activeSession) {
      toast.error("Create a session first.");
      return;
    }
    if (!message.trim()) return;
    if (!toolAllowed) {
      toast.error(`"${TOOL_LABELS[activeTool]}" requires a higher plan.`);
      return;
    }

    startTransition(async () => {
      try {
        await sendAnalysisMessage({
          sessionId: data.activeSession!.id,
          message: message.trim(),
          tool: activeTool,
        });
        setMessage("");
        await sync(data.activeSession!.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Message failed.");
      }
    });
  };

  const onSaveDraftMeta = () => {
    if (!data.activeSession) return;
    startTransition(async () => {
      try {
        await updateAnalysisSessionDraft({
          sessionId: data.activeSession!.id,
          title: sessionTitle,
          objective,
          budget,
          deadline: deadline || undefined,
          mode,
          modelId,
        });
        await sync(data.activeSession!.id);
        toast.success("Draft settings saved.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save settings.");
      }
    });
  };

  const onConvert = (action: "draft" | "publish") => {
    if (!data.activeSession) return;
    startTransition(async () => {
      try {
        await updateAnalysisSessionDraft({
          sessionId: data.activeSession!.id,
          title: sessionTitle,
          objective,
          budget,
          deadline: deadline || undefined,
          mode,
          modelId,
        });
        const result = await convertAnalysisToProject({
          sessionId: data.activeSession!.id,
          action,
        });
        if ("checkoutUrl" in result && result.checkoutUrl) {
          toast.success("Redirecting to Flutterwave checkout...");
          window.location.assign(result.checkoutUrl);
          return;
        }
        toast.success("Project created as draft.");
        router.push(`/dashboard/client/projects/${result.projectId}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not convert analysis.");
      }
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr_360px]">
      <Card className="h-[74vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Sessions</CardTitle>
            <Badge variant="outline" className="uppercase">{data.tier}</Badge>
          </div>
          <CardDescription>{data.sessions.length}/{data.limits.maxSessions} used</CardDescription>
          <Button size="sm" className="w-full gap-2" onClick={onCreateSession} disabled={pending}>
            <MessageSquarePlus className="h-4 w-4" />
            New Session
          </Button>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[calc(74vh-150px)] px-3 py-3">
          <div className="space-y-2">
            {data.sessions.map((session) => (
              <button
                key={session.id}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${data.activeSession?.id === session.id ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/70"}`}
                onClick={() => onOpenSession(session.id)}
              >
                <p className="line-clamp-1 text-sm font-semibold">{session.title}</p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Updated {format(new Date(session.updatedAt), "MMM d, HH:mm")}
                </p>
              </button>
            ))}
            {data.sessions.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-xs text-zinc-500">
                Create a session to start project analysis.
              </p>
            ) : null}
          </div>
        </ScrollArea>
      </Card>

      <Card className="h-[74vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">AI Brainstorm</CardTitle>
              <CardDescription>Persistent chat with project drafting tools</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={activeTool} onValueChange={(value) => setActiveTool(value as ToolMode)}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TOOL_LABELS) as ToolMode[]).map((tool) => (
                    <SelectItem key={tool} value={tool} disabled={!data.limits.tools.includes(tool)}>
                      {TOOL_LABELS[tool]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!toolAllowed ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/billing">Upgrade</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[calc(74vh-230px)] px-4 py-4">
          <div className="space-y-3">
            {data.messages.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 ${item.role === "user" ? "ml-8 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60" : item.role === "assistant" ? "mr-8 border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/60"}`}
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
                  {item.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : item.role === "user" ? <Brain className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {item.role}
                  {item.tool ? <Badge variant="outline" className="text-[10px]">{item.tool}</Badge> : null}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
                {item.refs?.length ? (
                  <div className="mt-3 space-y-1 rounded-lg border border-zinc-200/70 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">References</p>
                    {item.refs.map((ref, idx) => (
                      <a key={`${item.id}-${idx}`} href={ref.url} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400">
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{ref.title || ref.url}</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {data.messages.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
                No messages yet. Ask AI to analyze scope, budget, technical options, or references.
              </div>
            ) : null}
          </div>
        </ScrollArea>
        <Separator />
        <div className="space-y-2 p-4">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={`Ask AI about ${TOOL_LABELS[activeTool].toLowerCase()}...`}
            className="min-h-24"
            disabled={!data.activeSession || pending}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Tool access depends on plan. Current: <span className="font-semibold uppercase">{data.tier}</span>
            </p>
            <Button className="gap-2" onClick={onSend} disabled={!data.activeSession || !message.trim() || pending || !toolAllowed}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      </Card>

      <Card className="h-[74vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <WandSparkles className="h-4 w-4" />
            Project Draft
          </CardTitle>
          <CardDescription>Live output from brainstorming. Edit and convert when ready.</CardDescription>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[calc(74vh-120px)] px-4 py-4">
          {data.activeSession ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Project Title</Label>
                <Input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="Project title" />
              </div>
              <div className="grid gap-2">
                <Label>Objective / Description</Label>
                <Textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Budget (USD)</Label>
                  <Input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="5000" />
                </div>
                <div className="grid gap-2">
                  <Label>Deadline</Label>
                  <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Mode</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as SessionMode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={modelId} onValueChange={(value) => setModelId(value as AiModelId)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={onSaveDraftMeta} disabled={pending}>
                Save Draft Settings
              </Button>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Saved Links</p>
                <div className="space-y-1">
                  {data.activeSession.links.length > 0 ? (
                    data.activeSession.links.slice(0, 8).map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="line-clamp-1 block text-xs text-blue-600 hover:underline dark:text-blue-400">
                        {url}
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">No links stored yet.</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => onConvert("draft")} disabled={!canConvert || pending}>
                  Convert to Project Draft
                </Button>
                <Button className="w-full" onClick={() => onConvert("publish")} disabled={!canConvert || pending}>
                  Convert and Pay to Publish
                </Button>
                <p className="text-[11px] text-zinc-500">
                  Publish redirects to Flutterwave checkout using the project budget amount.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
              Create or open a session to start.
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
