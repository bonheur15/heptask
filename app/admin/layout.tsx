import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, CreditCard, LayoutDashboard, Shield, Users } from "lucide-react";
import { auth } from "@/auth";
import { AdminLogoutButton } from "./_components/admin-logout-button";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: Shield },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");
  if (session.user.isSuspended) redirect("/login");
  if (session.user.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_95%_5%,rgba(56,189,248,0.12),transparent_30%)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/75">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Super Admin Console</p>
              <h1 className="text-2xl font-bold tracking-tight">Platform Operations</h1>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </Link>
              <AdminLogoutButton />
            </nav>
          </div>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
