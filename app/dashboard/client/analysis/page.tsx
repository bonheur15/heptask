import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getAnalysisWorkspaceData } from "./_actions";
import { AnalysisWorkspace } from "./_components/analysis-workspace";

export default async function ClientAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "client") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const data = await getAnalysisWorkspaceData(params.session);

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-2xl border border-zinc-200/70 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
        <h1 className="text-2xl font-bold tracking-tight">Project Analysis Lab</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Brainstorm with AI, capture references, and convert directly to project draft or paid publishing.
        </p>
      </div>
      <AnalysisWorkspace initialData={data} />
    </div>
  );
}
