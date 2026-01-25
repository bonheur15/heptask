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

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Updates across active projects and workspaces.
        </p>
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
                  <p className="text-sm font-semibold">{message.project.title}</p>
                  <p className="text-xs text-zinc-500">
                    {message.sender?.name ?? "User"} • {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                  </p>
                  <p className="text-sm text-zinc-500 line-clamp-2">{message.content}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${workspacePrefix}/${message.projectId}`}>Open Workspace</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
              <p>No messages yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
