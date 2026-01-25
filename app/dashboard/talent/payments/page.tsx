import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Banknote, Calendar, CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTalentPaymentsData } from "./_actions";
import { WithdrawalForm } from "./_components/withdrawal-form";
import { PayoutTransaction, WithdrawalRequest } from "@/lib/types";

const parseAmount = (value: string | null) => {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
};

export default async function TalentPaymentsPage() {
  const { wallet, payouts, withdrawals, projects } = await getTalentPaymentsData();

  const totalEarned = payouts.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const pendingWithdrawals = withdrawals.filter((item) => item.status === "pending").length;
  const latestPayout = payouts[0];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings & Withdrawals</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Track your payouts, manage withdrawals, and download invoices.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/talent">
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
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Balance</p>
              <p className="text-xl font-bold">{wallet.balance} {wallet.currency}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Earned</p>
              <p className="text-xl font-bold">${totalEarned.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pending Withdrawals</p>
              <p className="text-xl font-bold">{pendingWithdrawals}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Latest Payout</p>
              <p className="text-xl font-bold">
                {latestPayout ? `$${parseAmount(latestPayout.amount).toFixed(2)}` : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 gap-8">
          <TabsTrigger value="overview" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Overview
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Withdrawals
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            History
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 border-b-2 border-transparent rounded-none px-0 pb-3 h-full bg-transparent shadow-none">
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payout Summary</CardTitle>
                <CardDescription>Recent payouts across active projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {payouts.length > 0 ? (
                  payouts.slice(0, 5).map((payout: PayoutTransaction) => {
                    const projectTitle = projects.find((item) => item.id === payout.projectId)?.title ?? "Project";
                    return (
                      <div key={payout.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                        <div>
                          <p className="text-sm font-semibold">{projectTitle}</p>
                          <p className="text-[10px] text-zinc-400 capitalize">{payout.type.replace("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${parseAmount(payout.amount).toFixed(2)}</p>
                          <p className="text-[10px] text-zinc-400">
                            {formatDistanceToNow(payout.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500">No payouts yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>Request a payout to your preferred method.</CardDescription>
              </CardHeader>
              <CardContent>
                <WithdrawalForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Track processing and payout status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right pr-6">Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.length > 0 ? (
                    withdrawals.map((item: WithdrawalRequest) => (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6 font-semibold">${parseAmount(item.amount).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{item.method}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "paid" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-zinc-500">{item.note ?? "-"}</TableCell>
                      <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/talent/payments/receipts/${item.id}`}>Receipt</Link>
                          </Button>
                        </div>
                      </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                        No withdrawals yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Full ledger of payouts linked to your projects.</CardDescription>
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
                  {payouts.length > 0 ? (
                    payouts.map((tx: PayoutTransaction) => {
                      const projectTitle = projects.find((item) => item.id === tx.projectId)?.title ?? "Project";
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="pl-6 font-semibold">{projectTitle}</TableCell>
                          <TableCell className="capitalize">{tx.type.replace("_", " ")}</TableCell>
                          <TableCell>${parseAmount(tx.amount).toFixed(2)}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-zinc-500">{tx.note ?? "-"}</TableCell>
                          <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                            <div className="flex items-center justify-end gap-2">
                              <span>{formatDistanceToNow(tx.createdAt, { addSuffix: true })}</span>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/talent/payments/receipts/${tx.id}`}>Receipt</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                        No payouts yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Download invoices for completed payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payouts.length > 0 ? (
                payouts.map((tx) => {
                  const projectTitle = projects.find((item) => item.id === tx.projectId)?.title ?? "Project";
                  return (
                    <div key={tx.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                      <div>
                        <p className="text-sm font-semibold">{projectTitle}</p>
                        <p className="text-[10px] text-zinc-400">
                          Invoice #{tx.id.slice(0, 8)} • ${parseAmount(tx.amount).toFixed(2)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/talent/payments/receipts/${tx.id}`}>Receipt</Link>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-500">No invoices available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
