import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBillingData } from "./_actions";
import { UpgradeButton } from "./_components/upgrade-button";

const tierOrder = {
  free: 0,
  pro: 1,
  enterprise: 2,
} as const;

export default async function BillingPage() {
  const data = await getBillingData();
  const currentTier = data.user?.accountTier ?? "free";
  const currentTierStatus = data.user?.accountTierStatus ?? "active";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upgrade your account capabilities and manage plan payments.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-gradient-to-r from-zinc-900 to-zinc-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan: {currentTier.toUpperCase()}
          </CardTitle>
          <CardDescription className="text-white/70">
            Status: {currentTierStatus}. Upgrades unlock advanced matching, priority access, and enterprise tooling.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic account access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">$0</p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Standard workspace tools</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Base support queue</li>
            </ul>
            <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">Current baseline</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-zinc-300 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Pro <Sparkles className="h-4 w-4 text-amber-500" /></CardTitle>
            <CardDescription>Faster operations for serious users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">${data.proPrice.toFixed(2)}</p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority placement boost</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Enhanced analytics views</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Premium support channel</li>
            </ul>
            <UpgradeButton
              tier="pro"
              disabled={tierOrder[currentTier as keyof typeof tierOrder] >= tierOrder.pro}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-zinc-300 dark:border-zinc-700">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Maximum control for teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">${data.enterprisePrice.toFixed(2)}</p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Company-priority access</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Team administration controls</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dedicated support workflows</li>
            </ul>
            <UpgradeButton
              tier="enterprise"
              disabled={tierOrder[currentTier as keyof typeof tierOrder] >= tierOrder.enterprise}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade History</CardTitle>
          <CardDescription>Recent plan payment attempts and confirmations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right pr-6">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.length > 0 ? (
                data.payments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 font-semibold capitalize">{item.targetTier}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "paid" ? "default" : item.status === "failed" ? "destructive" : "secondary"}
                        className="uppercase text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.currency} {item.amount}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-zinc-500">{item.txRef}</TableCell>
                    <TableCell className="text-right pr-6 text-zinc-400 text-xs">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                    No upgrade history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
