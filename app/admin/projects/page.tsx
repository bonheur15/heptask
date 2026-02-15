import { formatDistanceToNow } from "date-fns";
import { getAdminAuditLogs, getAdminProjectsPageData } from "../_actions";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminProjectRow } from "../_components/admin-project-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    auditPage?: string;
  }>;
}) {
  const params = await searchParams;
  const [projectsData, auditData] = await Promise.all([
    getAdminProjectsPageData({
      page: params.page,
      q: params.q,
      status: params.status,
    }),
    getAdminAuditLogs({
      page: params.auditPage,
      action: "project",
    }),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Filter and alter project lifecycle state across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-3">
            <Input name="q" defaultValue={params.q ?? ""} placeholder="Search title/description" />
            <select name="status" defaultValue={params.status ?? "all"} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="maintenance">maintenance</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
            <button type="submit" className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              Apply filters
            </button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectsData.rows.map((item) => (
                <AdminProjectRow key={item.id} item={item} />
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            basePath="/admin/projects"
            page={projectsData.pagination.page}
            totalPages={projectsData.pagination.totalPages}
            query={{
              q: params.q,
              status: params.status,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Audit Log</CardTitle>
          <CardDescription>Recent project-level admin operations.</CardDescription>
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
            basePath="/admin/projects"
            page={auditData.pagination.page}
            totalPages={auditData.pagination.totalPages}
            query={{
              q: params.q,
              status: params.status,
              auditPage: params.auditPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
