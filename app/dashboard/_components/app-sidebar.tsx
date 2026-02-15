"use client";

import * as React from "react";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Crown,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User as UserType } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppSidebar({ user }: { user: UserType }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const isClient = user.role === "client";
  const isCompany = user.role === "company";
  const isTalent = user.role === "talent";

  const dashboardUrl =
    isClient
      ? "/dashboard/client"
      : isCompany
        ? "/company/dashboard"
        : "/dashboard/talent";

  const overviewNav = [
    {
      title: isCompany ? "Company Dashboard" : "Dashboard",
      url: dashboardUrl,
      icon: isCompany ? Building2 : LayoutDashboard,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
    },
  ];

  const clientNav = [
    { title: "Projects", url: "/dashboard/client", icon: Briefcase },
    { title: "Create Project", url: "/dashboard/client/projects/create", icon: Sparkles },
    { title: "Payments", url: "/dashboard/client/payments", icon: CreditCard },
  ];

  const talentNav = [
    { title: "My Work", url: "/dashboard/talent", icon: Briefcase },
    { title: "Browse Jobs", url: "/dashboard/talent/jobs", icon: Search },
    { title: "Payments", url: "/dashboard/talent/payments", icon: CreditCard },
  ];

  const companyNav = [
    { title: "Team Management", url: "/company/team", icon: Users },
    { title: "Priority Queue", url: "/company/priority", icon: Target },
    { title: "Assignments", url: "/company/dashboard", icon: ClipboardList },
    { title: "Browse Talent Jobs", url: "/dashboard/talent/jobs", icon: Search },
  ];

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const tierLabel = (user.accountTier ?? "free").toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Heptadev</span>
                  <span className="truncate text-xs capitalize">{user.role} · {user.accountTier ?? "free"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {isClient ? (
          <SidebarGroup>
            <SidebarGroupLabel>Client Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {isTalent ? (
          <SidebarGroup>
            <SidebarGroupLabel>Talent Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {talentNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {isCompany ? (
          <SidebarGroup>
            <SidebarGroupLabel>Company Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {companyNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={isActive("/dashboard/profile")}>
                  <Link href="/dashboard/profile">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Billing" isActive={isActive("/dashboard/billing")}>
                  <Link href="/dashboard/billing">
                    <CreditCard />
                    <span>Billing & Plans</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="space-y-3">
        <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-2 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-2 flex items-center justify-between rounded-lg border border-zinc-200/60 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              {tierLabel}
            </div>
            <Link href="/dashboard/billing" className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50">
              Manage
            </Link>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard/billing"
              className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Billing & Plans
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image || ""} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name}
                      </span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Plans
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/messages">
                      <Bell className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
