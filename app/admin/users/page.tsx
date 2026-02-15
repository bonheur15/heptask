import { formatDistanceToNow } from "date-fns";
import { getAdminAuditLogs, getAdminUsersPageData } from "../_actions";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminUserRow } from "../_components/admin-user-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    role?: string;
    suspension?: "all" | "active" | "suspended";
    auditPage?: string;
  }>;
}) {
  const params = await searchParams;
  const [usersData, auditData] = await Promise.all([
    getAdminUsersPageData({
      page: params.page,
      q: params.q,
      role: params.role,
      suspension: params.suspension,
    }),
    getAdminAuditLogs({
      page: params.auditPage,
      action: "user",
    }),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search, filter, suspend, delete, and edit account privileges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-4">
            <Input name="q" defaultValue={params.q ?? ""} placeholder="Search name/email" />
            <select name="role" defaultValue={params.role ?? "all"} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">All roles</option>
              <option value="client">client</option>
              <option value="talent">talent</option>
              <option value="company">company</option>
              <option value="super_admin">super_admin</option>
            </select>
            <select name="suspension" defaultValue={params.suspension ?? "all"} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
            <button type="submit" className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              Apply filters
            </button>
          </form>

          <div className="space-y-3">
            {usersData.rows.map((item) => (
              <AdminUserRow key={item.id} item={item} />
            ))}
          </div>

          <AdminPagination
            basePath="/admin/users"
            page={usersData.pagination.page}
            totalPages={usersData.pagination.totalPages}
            query={{
              q: params.q,
              role: params.role,
              suspension: params.suspension,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Audit Log</CardTitle>
          <CardDescription>Recent user management actions.</CardDescription>
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
            basePath="/admin/users"
            page={auditData.pagination.page}
            totalPages={auditData.pagination.totalPages}
            query={{
              q: params.q,
              role: params.role,
              suspension: params.suspension,
              auditPage: params.auditPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
