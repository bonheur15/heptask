import { auth } from "@/auth";
import { db } from "@/db";
import { project, projectMessage } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Timer, FolderKanban, AlertCircle } from "lucide-react";

export default async function MessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.role) {
    redirect("/dashboard");
  }

  const isClient = session.user.role === "client";
  const isTalent = session.user.role === "talent" || session.user.role === "company";

  if (!isClient && !isTalent) {
    redirect("/dashboard");
  }

  const projects = await db.query.project.findMany({
    where: isClient
      ? eq(project.clientId, session.user.id)
      : eq(project.talentId, session.user.id),
  });
  const projectIds = projects.map((item) => item.id);

  const messages = projectIds.length
    ? await db.query.projectMessage.findMany({
        where: inArray(projectMessage.projectId, projectIds),
        with: {
          project: true,
          sender: true,
        },
        orderBy: desc(projectMessage.createdAt),
        limit: 50,
      })
    : [];

  const workspacePrefix = isClient ? "/dashboard/client/work" : "/dashboard/talent/work";
  const recentMessages = messages.filter((msg) => msg.createdAt.getTime() > Date.now() - 1000 * 60 * 60 * 24).length;
  const systemUpdates = messages.filter((msg) => msg.role === "system").length;
  const openThreads = new Set(messages.map((msg) => msg.projectId)).size;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Updates across active projects and workspaces.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/40 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Recent 24h</p>
              <p className="text-xl font-semibold">{recentMessages}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/40 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Open Threads</p>
              <p className="text-xl font-semibold">{openThreads}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/40 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">System Updates</p>
              <p className="text-xl font-semibold">{systemUpdates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/40 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Timer className="h-5 w-5 text-zinc-600" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Role</p>
              <p className="text-xl font-semibold capitalize">{session.user.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Latest updates from your project workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="rounded-xl border p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{message.project.title}</p>
                    <Badge variant={message.role === "system" ? "secondary" : "outline"} className="uppercase text-[10px]">
                      {message.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {message.sender?.name ?? "User"} • {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                  </p>
                  <p className="text-sm text-zinc-500 line-clamp-2">{message.body}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${workspacePrefix}/${message.projectId}`}>Open Workspace</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Once a project starts, workspace communication will appear here.</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href="/dashboard/client">Back to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
