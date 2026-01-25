import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClientPaymentsData } from "./_actions";
import { DepositForm } from "./_components/deposit-form";
import { ManualReleaseForm } from "./_components/manual-release-form";
import { RefundForm } from "./_components/refund-form";
import { MilestoneReleaseList } from "./_components/milestone-release-list";
import { EscrowTransaction, Milestone, Project } from "@/lib/types";

const parseAmount = (value: string | null) => {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
};

type ProjectSummary = {
  id: string;
  title: string;
  budget: number;
  deposits: number;
  releases: number;
  refunds: number;
  manualReleased: number;
  remaining: number;
  milestones: Milestone[];
};

type ProjectWithMilestones = Project & {
  milestones: Milestone[];
};

export default async function ClientPaymentsPage() {
  const { projects, transactions, escrow } = await getClientPaymentsData();

  const projectSummaries: ProjectSummary[] = projects.map((project: ProjectWithMilestones) => {
    const related = transactions.filter((item) => item.projectId === project.id);
    const deposits = related.filter((item) => item.type === "deposit").reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const releases = related.filter((item) => item.type === "milestone_release").reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const manualReleased = related.filter((item) => item.type === "manual_release").reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const refunds = related.filter((item) => item.type === "refund").reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const remaining = Math.max(deposits - releases - manualReleased - refunds, 0);
    return {
      id: project.id,
      title: project.title,
      budget: parseAmount(project.budget ?? "0"),
      deposits,
      releases,
      refunds,
      manualReleased,
      remaining,
      milestones: project.milestones ?? [],
    };
  });

  const totals = projectSummaries.reduce(
    (acc, project) => {
      acc.deposits += project.deposits;
      acc.releases += project.releases + project.manualReleased;
      acc.refunds += project.refunds;
      return acc;
    },
    { deposits: 0, releases: 0, refunds: 0 },
  );

  const activeMilestones = projectSummaries.flatMap((project) =>
    project.milestones.filter((m) => m.status === "completed"),
  ).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow & Payments</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Fund projects, release milestones, and manage refunds securely.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Escrow Balance</p>
              <p className="text-xl font-bold">{escrow.balance} {escrow.currency}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Deposited</p>
              <p className="text-xl font-bold">${totals.deposits.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Released</p>
              <p className="text-xl font-bold">${totals.releases.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pending Releases</p>
              <p className="text-xl font-bold">{activeMilestones}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 gap-8">
          <TabsTrigger value="overview" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Milestone Releases
          </TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Manual Release
          </TabsTrigger>
          <TabsTrigger value="refunds" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Escrow Overview</CardTitle>
                <CardDescription>Track deposits, releases, and remaining escrow per project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectSummaries.length > 0 ? (
                  projectSummaries.map((project) => (
                    <div key={project.id} className="rounded-2xl border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{project.title}</p>
                          <p className="text-[10px] text-zinc-400">Budget ${project.budget.toFixed(2)}</p>
                        </div>
                        <Badge variant={project.remaining > 0 ? "secondary" : "default"}>
                          {project.remaining > 0 ? "Escrow Open" : "Settled"}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4 text-xs text-zinc-500">
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-zinc-400">Deposited</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${project.deposits.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-zinc-400">Released</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${(project.releases + project.manualReleased).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-zinc-400">Refunded</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${project.refunds.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-zinc-400">Remaining</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${project.remaining.toFixed(2)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/client/work/${project.id}`}>Open workspace</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No projects available yet.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Add escrow for a project before work begins.</CardDescription>
              </CardHeader>
              <CardContent>
                <DepositForm projects={projects.map((project) => ({ id: project.id, title: project.title }))} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Escrow movement across your projects.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right pr-6">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx: EscrowTransaction) => {
                      const projectName = projects.find((item) => item.id === tx.projectId)?.title ?? "Project";
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="pl-6 font-semibold">{projectName}</TableCell>
                          <TableCell className="capitalize">{tx.type.replace("_", " ")}</TableCell>
                          <TableCell>${parseAmount(tx.amount).toFixed(2)}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-zinc-500">{tx.note ?? "-"}</TableCell>
                          <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                            <div className="flex items-center justify-end gap-2">
                              <span>{formatDistanceToNow(tx.createdAt, { addSuffix: true })}</span>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/client/payments/receipts/${tx.id}`}>Receipt</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Releases</CardTitle>
              <CardDescription>Release completed milestones and log escrow payouts.</CardDescription>
            </CardHeader>
            <CardContent>
              <MilestoneReleaseList
                projects={projects.map((project: ProjectWithMilestones) => ({
                  id: project.id,
                  title: project.title,
                  milestones: project.milestones ?? [],
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Release</CardTitle>
              <CardDescription>Release funds early for materials or onboarding. Max 50% of budget.</CardDescription>
            </CardHeader>
            <CardContent>
              <ManualReleaseForm
                projects={projectSummaries.map((project) => ({
                  id: project.id,
                  title: project.title,
                  manualReleased: project.manualReleased,
                  maxManualRelease: project.budget * 0.5,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refunds</CardTitle>
              <CardDescription>Request a refund if a project is cancelled or scope changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <RefundForm projects={projects.map((project) => ({ id: project.id, title: project.title }))} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
