import { formatDistanceToNow } from "date-fns";
import { getAdminAuditLogs, getAdminPaymentsPageData } from "../_actions";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminPaymentRow } from "../_components/admin-payment-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    kind?: "all" | "withdrawal" | "publication" | "upgrade";
    status?: string;
    auditPage?: string;
  }>;
}) {
  const params = await searchParams;

  const [paymentsData, auditData] = await Promise.all([
    getAdminPaymentsPageData({
      page: params.page,
      kind: params.kind,
      status: params.status,
    }),
    getAdminAuditLogs({
      page: params.auditPage,
      action: "payment",
    }),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payments & Approvals</CardTitle>
          <CardDescription>Manage withdrawals, publication charges, and upgrade payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-3">
            <select name="kind" defaultValue={params.kind ?? "all"} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">All types</option>
              <option value="withdrawal">withdrawal</option>
              <option value="publication">publication</option>
              <option value="upgrade">upgrade</option>
            </select>
            <select name="status" defaultValue={params.status ?? "all"} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
            </select>
            <button type="submit" className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              Apply filters
            </button>
          </form>

          <div className="space-y-2">
            {paymentsData.rows.map((item) => (
              <AdminPaymentRow key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>

          <AdminPagination
            basePath="/admin/payments"
            page={paymentsData.pagination.page}
            totalPages={paymentsData.pagination.totalPages}
            query={{
              kind: params.kind,
              status: params.status,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Audit Log</CardTitle>
          <CardDescription>Recent payment-related admin actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditData.rows.map((row) => (
            <div key={row.id} className="rounded-lg border p-3">
              <p className="text-sm font-semibold">{row.action}</p>
              <p className="text-xs text-zinc-500">
                by {row.adminUser?.email ?? row.adminUserId} • {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
          <AdminPagination
            basePath="/admin/payments"
            page={auditData.pagination.page}
            totalPages={auditData.pagination.totalPages}
            query={{
              kind: params.kind,
              status: params.status,
              auditPage: params.auditPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
