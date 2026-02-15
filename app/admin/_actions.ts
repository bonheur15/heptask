"use server";

import { headers } from "next/headers";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { hashPassword } from "better-auth/crypto";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  account,
  accountUpgradePayment,
  adminAuditLog,
  project,
  projectPublicationPayment,
  user,
  withdrawalRequest,
} from "@/db/schema";
import { createCredentialUser, ManagedAccountTier, ManagedUserRole } from "@/lib/auth/create-user";

const USERS_PAGE_SIZE = 20;
const PROJECTS_PAGE_SIZE = 20;
const PAYMENTS_PAGE_SIZE = 20;
const AUDIT_PAGE_SIZE = 30;

const assertSuperAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Unauthorized");
  }
  return session.user;
};

const toPage = (value: number | string | undefined) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
};

const logAdminAction = async (input: {
  adminUserId: string;
  action: string;
  targetType: "user" | "project" | "payment" | "withdrawal" | "system";
  targetId?: string | null;
  metadata?: unknown;
}) => {
  await db.insert(adminAuditLog).values({
    id: nanoid(),
    adminUserId: input.adminUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
};

export async function getAdminOverviewData() {
  await assertSuperAdmin();

  const [
    totalUsers,
    totalProjects,
    activeProjects,
    publicationPayments,
    upgradePayments,
    pendingWithdrawals,
    recentAudit,
  ] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(project),
    db.select({ value: count() }).from(project).where(eq(project.status, "active")),
    db.query.projectPublicationPayment.findMany({
      columns: { amount: true, status: true },
    }),
    db.query.accountUpgradePayment.findMany({
      columns: { amount: true, status: true },
    }),
    db.select({ value: count() }).from(withdrawalRequest).where(
      or(eq(withdrawalRequest.status, "pending"), eq(withdrawalRequest.status, "processing")),
    ),
    db.query.adminAuditLog.findMany({
      with: {
        adminUser: {
          columns: { id: true, email: true, name: true },
        },
      },
      orderBy: desc(adminAuditLog.createdAt),
      limit: 12,
    }),
  ]);

  const totalPublicationRevenue = publicationPayments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + (Number.parseFloat(item.amount || "0") || 0), 0);
  const totalUpgradeRevenue = upgradePayments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + (Number.parseFloat(item.amount || "0") || 0), 0);

  return {
    stats: {
      totalUsers: totalUsers[0]?.value ?? 0,
      totalProjects: totalProjects[0]?.value ?? 0,
      activeProjects: activeProjects[0]?.value ?? 0,
      totalPublicationRevenue,
      totalUpgradeRevenue,
      totalRevenue: totalPublicationRevenue + totalUpgradeRevenue,
      pendingWithdrawals: pendingWithdrawals[0]?.value ?? 0,
    },
    recentAudit,
  };
}

export async function getAdminUsersPageData(input: {
  page?: number | string;
  q?: string;
  role?: string;
  suspension?: "all" | "active" | "suspended";
}) {
  await assertSuperAdmin();
  const page = toPage(input.page);
  const q = input.q?.trim();
  const role = input.role?.trim();
  const suspension = input.suspension || "all";

  const where = and(
    q
      ? or(
        ilike(user.email, `%${q}%`),
        ilike(user.name, `%${q}%`),
      )
      : undefined,
    role && role !== "all" ? eq(user.role, role) : undefined,
    suspension === "suspended"
      ? eq(user.isSuspended, true)
      : suspension === "active"
        ? eq(user.isSuspended, false)
        : undefined,
  );

  const [rows, totalRows] = await Promise.all([
    db.query.user.findMany({
      where,
      orderBy: desc(user.createdAt),
      limit: USERS_PAGE_SIZE,
      offset: (page - 1) * USERS_PAGE_SIZE,
    }),
    db.select({ value: count() }).from(user).where(where),
  ]);

  return {
    rows,
    pagination: {
      page,
      pageSize: USERS_PAGE_SIZE,
      total: totalRows[0]?.value ?? 0,
      totalPages: Math.max(1, Math.ceil((totalRows[0]?.value ?? 0) / USERS_PAGE_SIZE)),
    },
  };
}

export async function getAdminProjectsPageData(input: {
  page?: number | string;
  q?: string;
  status?: string;
}) {
  await assertSuperAdmin();
  const page = toPage(input.page);
  const q = input.q?.trim();
  const status = input.status?.trim();

  const where = and(
    q
      ? or(
        ilike(project.title, `%${q}%`),
        ilike(project.description, `%${q}%`),
      )
      : undefined,
    status && status !== "all" ? eq(project.status, status) : undefined,
  );

  const [rows, totalRows] = await Promise.all([
    db.query.project.findMany({
      where,
      with: {
        client: { columns: { id: true, email: true, name: true } },
        talent: { columns: { id: true, email: true, name: true } },
      },
      orderBy: desc(project.createdAt),
      limit: PROJECTS_PAGE_SIZE,
      offset: (page - 1) * PROJECTS_PAGE_SIZE,
    }),
    db.select({ value: count() }).from(project).where(where),
  ]);

  return {
    rows,
    pagination: {
      page,
      pageSize: PROJECTS_PAGE_SIZE,
      total: totalRows[0]?.value ?? 0,
      totalPages: Math.max(1, Math.ceil((totalRows[0]?.value ?? 0) / PROJECTS_PAGE_SIZE)),
    },
  };
}

export async function getAdminPaymentsPageData(input: {
  page?: number | string;
  kind?: "all" | "withdrawal" | "publication" | "upgrade";
  status?: string;
}) {
  await assertSuperAdmin();
  const page = toPage(input.page);
  const kind = input.kind || "all";
  const status = input.status?.trim();

  const [withdrawals, publications, upgrades] = await Promise.all([
    kind === "all" || kind === "withdrawal"
      ? db.query.withdrawalRequest.findMany({
        where: status && status !== "all" ? eq(withdrawalRequest.status, status) : undefined,
        orderBy: desc(withdrawalRequest.createdAt),
      })
      : Promise.resolve([]),
    kind === "all" || kind === "publication"
      ? db.query.projectPublicationPayment.findMany({
        where: status && status !== "all" ? eq(projectPublicationPayment.status, status) : undefined,
        orderBy: desc(projectPublicationPayment.createdAt),
      })
      : Promise.resolve([]),
    kind === "all" || kind === "upgrade"
      ? db.query.accountUpgradePayment.findMany({
        where: status && status !== "all" ? eq(accountUpgradePayment.status, status) : undefined,
        orderBy: desc(accountUpgradePayment.createdAt),
      })
      : Promise.resolve([]),
  ]);

  const merged = [
    ...withdrawals.map((item) => ({ ...item, kind: "withdrawal" as const, createdAt: item.createdAt })),
    ...publications.map((item) => ({ ...item, kind: "publication" as const, createdAt: item.createdAt })),
    ...upgrades.map((item) => ({ ...item, kind: "upgrade" as const, createdAt: item.createdAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = merged.length;
  const pagedRows = merged.slice((page - 1) * PAYMENTS_PAGE_SIZE, page * PAYMENTS_PAGE_SIZE);

  return {
    rows: pagedRows,
    pagination: {
      page,
      pageSize: PAYMENTS_PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE)),
    },
  };
}

export async function getAdminAuditLogs(input: {
  page?: number | string;
  action?: string;
}) {
  await assertSuperAdmin();
  const page = toPage(input.page);
  const action = input.action?.trim();

  const where = action && action !== "all"
    ? ilike(adminAuditLog.action, `%${action}%`)
    : undefined;

  const [rows, totalRows] = await Promise.all([
    db.query.adminAuditLog.findMany({
      where,
      with: {
        adminUser: {
          columns: { id: true, email: true, name: true },
        },
      },
      orderBy: desc(adminAuditLog.createdAt),
      limit: AUDIT_PAGE_SIZE,
      offset: (page - 1) * AUDIT_PAGE_SIZE,
    }),
    db.select({ value: count() }).from(adminAuditLog).where(where),
  ]);

  return {
    rows,
    pagination: {
      page,
      pageSize: AUDIT_PAGE_SIZE,
      total: totalRows[0]?.value ?? 0,
      totalPages: Math.max(1, Math.ceil((totalRows[0]?.value ?? 0) / AUDIT_PAGE_SIZE)),
    },
  };
}

export async function adminCreateUser(input: {
  name: string;
  email: string;
  password: string;
  role: ManagedUserRole;
  accountTier: ManagedAccountTier;
}) {
  const admin = await assertSuperAdmin();

  if (!input.name.trim() || !input.email.trim() || !input.password) {
    throw new Error("Name, email, and password are required.");
  }

  const created = await createCredentialUser({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    accountTier: input.accountTier,
    emailVerified: true,
  });

  await logAdminAction({
    adminUserId: admin.id,
    action: "create_user",
    targetType: "user",
    targetId: created.userId,
    metadata: {
      email: input.email,
      role: input.role,
      tier: input.accountTier,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function adminUpdateUser(input: {
  userId: string;
  name: string;
  role: ManagedUserRole;
  accountTier: ManagedAccountTier;
  accountTierStatus: "active" | "processing" | "requires_payment";
  emailVerified: boolean;
}) {
  const admin = await assertSuperAdmin();
  const targetUser = await db.query.user.findFirst({ where: eq(user.id, input.userId) });
  if (!targetUser) throw new Error("User not found.");

  await db.update(user).set({
    name: input.name.trim(),
    role: input.role,
    accountTier: input.accountTier,
    accountTierStatus: input.accountTierStatus,
    emailVerified: input.emailVerified,
    updatedAt: new Date(),
  }).where(eq(user.id, input.userId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_user",
    targetType: "user",
    targetId: input.userId,
    metadata: {
      previous: {
        name: targetUser.name,
        role: targetUser.role,
        tier: targetUser.accountTier,
        tierStatus: targetUser.accountTierStatus,
        emailVerified: targetUser.emailVerified,
      },
      next: {
        name: input.name,
        role: input.role,
        tier: input.accountTier,
        tierStatus: input.accountTierStatus,
        emailVerified: input.emailVerified,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function adminSetUserSuspension(input: {
  userId: string;
  suspend: boolean;
  reason?: string;
}) {
  const admin = await assertSuperAdmin();
  if (admin.id === input.userId) {
    throw new Error("You cannot suspend your own account.");
  }

  await db.update(user).set({
    isSuspended: input.suspend,
    suspendedAt: input.suspend ? new Date() : null,
    suspensionReason: input.suspend ? (input.reason?.trim() || "Suspended by super admin.") : null,
    updatedAt: new Date(),
  }).where(eq(user.id, input.userId));

  await logAdminAction({
    adminUserId: admin.id,
    action: input.suspend ? "suspend_user" : "unsuspend_user",
    targetType: "user",
    targetId: input.userId,
    metadata: {
      reason: input.reason?.trim() || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function adminDeleteUser(input: { userId: string }) {
  const admin = await assertSuperAdmin();
  if (admin.id === input.userId) {
    throw new Error("You cannot delete your own account.");
  }

  const target = await db.query.user.findFirst({ where: eq(user.id, input.userId) });
  if (!target) throw new Error("User not found.");
  if (target.role === "super_admin") {
    throw new Error("Cannot delete another super admin.");
  }

  await db.delete(user).where(eq(user.id, input.userId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "delete_user",
    targetType: "user",
    targetId: input.userId,
    metadata: {
      email: target.email,
      role: target.role,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function adminResetUserPassword(input: {
  userId: string;
  newPassword: string;
}) {
  const admin = await assertSuperAdmin();
  if (!input.newPassword || input.newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const target = await db.query.account.findFirst({
    where: and(eq(account.userId, input.userId), eq(account.providerId, "credential")),
  });
  if (!target) {
    throw new Error("Credential account not found for this user.");
  }

  const hashed = await hashPassword(input.newPassword);
  await db.update(account).set({
    password: hashed,
    updatedAt: new Date(),
  }).where(eq(account.id, target.id));

  await logAdminAction({
    adminUserId: admin.id,
    action: "reset_user_password",
    targetType: "user",
    targetId: input.userId,
  });

  revalidatePath("/admin/users");
}

export async function adminUpdateProject(input: {
  projectId: string;
  status: "draft" | "active" | "maintenance" | "completed" | "cancelled";
}) {
  const admin = await assertSuperAdmin();
  const existing = await db.query.project.findFirst({ where: eq(project.id, input.projectId) });
  if (!existing) throw new Error("Project not found.");

  await db.update(project).set({
    status: input.status,
    updatedAt: new Date(),
  }).where(eq(project.id, input.projectId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_project_status",
    targetType: "project",
    targetId: input.projectId,
    metadata: {
      previousStatus: existing.status,
      nextStatus: input.status,
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/talent");
  revalidatePath("/company/dashboard");
}

export async function adminUpdateWithdrawal(input: {
  withdrawalId: string;
  status: "pending" | "processing" | "approved" | "rejected" | "paid";
  note?: string;
}) {
  const admin = await assertSuperAdmin();
  await db.update(withdrawalRequest).set({
    status: input.status,
    note: input.note?.trim() || null,
  }).where(eq(withdrawalRequest.id, input.withdrawalId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_withdrawal",
    targetType: "withdrawal",
    targetId: input.withdrawalId,
    metadata: {
      status: input.status,
      note: input.note?.trim() || null,
    },
  });

  revalidatePath("/admin/payments");
}

export async function adminUpdatePublicationPayment(input: {
  paymentId: string;
  status: "processing" | "paid" | "failed";
  note?: string;
}) {
  const admin = await assertSuperAdmin();
  await db.update(projectPublicationPayment).set({
    status: input.status,
    note: input.note?.trim() || null,
    updatedAt: new Date(),
  }).where(eq(projectPublicationPayment.id, input.paymentId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_publication_payment",
    targetType: "payment",
    targetId: input.paymentId,
    metadata: {
      status: input.status,
      note: input.note?.trim() || null,
    },
  });

  revalidatePath("/admin/payments");
}

export async function adminUpdateUpgradePayment(input: {
  paymentId: string;
  status: "processing" | "paid" | "failed";
  note?: string;
}) {
  const admin = await assertSuperAdmin();
  await db.update(accountUpgradePayment).set({
    status: input.status,
    note: input.note?.trim() || null,
    updatedAt: new Date(),
  }).where(eq(accountUpgradePayment.id, input.paymentId));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_upgrade_payment",
    targetType: "payment",
    targetId: input.paymentId,
    metadata: {
      status: input.status,
      note: input.note?.trim() || null,
    },
  });

  revalidatePath("/admin/payments");
}

export async function adminUpdateOwnProfile(input: {
  name: string;
}) {
  const admin = await assertSuperAdmin();
  await db.update(user).set({
    name: input.name.trim(),
    updatedAt: new Date(),
  }).where(eq(user.id, admin.id));

  await logAdminAction({
    adminUserId: admin.id,
    action: "update_admin_profile",
    targetType: "system",
    targetId: admin.id,
  });

  revalidatePath("/admin");
}
