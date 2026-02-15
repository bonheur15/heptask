import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowRight, BookCheck, Briefcase, DollarSign, Users } from "lucide-react";
import { getAdminAuditLogs, getAdminOverviewData } from "./_actions";
import { CreateUserCard } from "./_components/create-user-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminOverviewPage() {
  const [overview, audit] = await Promise.all([
    getAdminOverviewData(),
    getAdminAuditLogs({ page: 1 }),
  ]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={String(overview.stats.totalUsers)} icon={Users} />
        <StatCard title="Projects" value={String(overview.stats.totalProjects)} icon={Briefcase} />
        <StatCard title="Active Projects" value={String(overview.stats.activeProjects)} icon={Activity} />
        <StatCard title="Total Revenue" value={`$${overview.stats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <CreateUserCard />
        <Card>
          <CardHeader>
            <CardTitle>Operations Snapshot</CardTitle>
            <CardDescription>Live signals from payment and release queues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span>Pending Withdrawals</span>
              <Badge>{overview.stats.pendingWithdrawals}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span>Publication Revenue</span>
              <span className="font-semibold">${overview.stats.totalPublicationRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span>Upgrade Revenue</span>
              <span className="font-semibold">${overview.stats.totalUpgradeRevenue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-4 w-4" />
              Recent Audit Trail
            </CardTitle>
            <CardDescription>Every admin action is logged with actor and target.</CardDescription>
          </div>
          <Link href="/admin/users" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
            Manage Users <ArrowRight className="inline h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.rows.slice(0, 12).map((row) => (
            <div key={row.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{row.action}</p>
                <Badge variant="outline">{row.targetType}</Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                by {row.adminUser?.email ?? row.adminUserId} • {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-none bg-zinc-50/80 dark:bg-zinc-900/55">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-zinc-500" />
      </CardContent>
    </Card>
  );
}
