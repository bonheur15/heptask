import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoleSelection } from "./_components/role-selection";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { User as UserType } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.isSuspended) {
    redirect("/login");
  }

  if (!session.user.role) {
    return <RoleSelection />;
  }

  if (session.user.role === "super_admin") {
    redirect("/admin");
  }

  const sidebarUser: UserType = {
    ...session.user,
    image: session.user.image ?? null,
    role: session.user.role ?? null,
    bio: session.user.bio ?? null,
    skills: session.user.skills ?? null,
    location: session.user.location ?? null,
    website: session.user.website ?? null,
    companyName: session.user.companyName ?? null,
    accountTier: session.user.accountTier ?? "free",
    accountTierStatus: session.user.accountTierStatus ?? "active",
    isSuspended: session.user.isSuspended ?? false,
    suspensionReason: session.user.suspensionReason ?? null,
    suspendedAt: session.user.suspendedAt ?? null,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
