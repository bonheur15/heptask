"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  user,
  project,
  escrow,
  notification,
  dispute,
  applicant,
  companyAssignment,
  companyTeam,
  projectPublicationPayment,
} from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isCompanyExclusiveProject } from "@/lib/projects/visibility";

export async function getTalentDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || (session.user.role !== "talent" && session.user.role !== "company")) {
    throw new Error("Unauthorized or not a talent/company");
  }

  const userId = session.user.id;

  const [
    appliedJobs,
    activeJobs,
    userEscrow,
    notifications,
    teamMemberships,
    memberAssignments,
  ] = await Promise.all([
    db.query.applicant.findMany({
      where: eq(applicant.userId, userId),
      with: { project: true },
      orderBy: desc(applicant.createdAt)
    }),
    db.query.project.findMany({
      where: eq(project.talentId, userId),
      orderBy: desc(project.updatedAt)
    }),
    db.select().from(escrow).where(eq(escrow.userId, userId)).limit(1),
    db.select().from(notification).where(eq(notification.userId, userId)).orderBy(desc(notification.createdAt)).limit(5),
    db.query.companyTeam.findMany({
      where: eq(companyTeam.memberId, userId),
      with: {
        company: true,
      },
      orderBy: desc(companyTeam.createdAt),
    }),
    db.query.companyAssignment.findMany({
      where: eq(companyAssignment.memberId, userId),
      with: {
        project: true,
      },
      orderBy: desc(companyAssignment.createdAt),
    }),
  ]);

  const companyLookup = new Map(
    teamMemberships.map((membership) => [membership.companyId, membership.company]),
  );
  const companyAssignments = memberAssignments
    .filter((assignment) => Boolean(assignment.project.talentId) && companyLookup.has(assignment.project.talentId as string))
    .map((assignment) => ({
      ...assignment,
      company: assignment.project.talentId
        ? companyLookup.get(assignment.project.talentId) ?? null
        : null,
    }));

  return {
    appliedJobs,
    activeJobs: activeJobs.filter(p => p.status === "active"),
    completedJobs: activeJobs.filter(p => p.status === "completed"),
    escrow: userEscrow[0] || { balance: "0", currency: "USD" },
    notifications,
    companyAssignments,
    stats: {
      rating: "4.9",
      totalJobs: activeJobs.length,
      completionRate: "100%",
    }
  };
}

export async function getAvailableJobs() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  // Show projects owned by other users and gate company-priority listings for 24h.
  const jobs = await db.query.project.findMany({
    where: and(
      ne(project.clientId, session.user.id)
    ),
    with: { client: true },
    orderBy: desc(project.createdAt)
  });

  const isCompany = session.user.role === "company";

  return jobs.filter((job) => {
    if (job.status !== "active") return false;
    if (job.talentId) return false;
    if (isCompany) return true;
    return !isCompanyExclusiveProject(job.companyExclusiveUntil);
  });
}

export async function getClientDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "client") {
    throw new Error("Unauthorized or not a client");
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [
    projects,
    publicationPayments,
    userEscrow,
    notifications,
    disputes
  ] = await Promise.all([
    db.select().from(project).where(eq(project.clientId, userId)).orderBy(desc(project.createdAt)),
    db.select().from(projectPublicationPayment).where(eq(projectPublicationPayment.userId, userId)).orderBy(desc(projectPublicationPayment.updatedAt)),
    db.select().from(escrow).where(eq(escrow.userId, userId)).limit(1),
    db.select().from(notification).where(eq(notification.userId, userId)).orderBy(desc(notification.createdAt)).limit(5),
    db.select().from(dispute)
      .innerJoin(project, eq(dispute.projectId, project.id))
      .where(eq(project.clientId, userId))
      .orderBy(desc(dispute.createdAt))
      .limit(5)
  ]);

  return {
    projects: {
      active: projects.filter(p => p.status === "active"),
      draft: projects.filter(p => p.status === "draft"),
      maintenance: projects.filter(p => p.status === "maintenance"),
      completed: projects.filter(p => p.status === "completed"),
    },
    escrow: userEscrow[0] || { balance: "0", currency: "USD" },
    notifications,
    disputes: disputes.map(d => ({ ...d.dispute, project: d.project })),
    publicationPayments,
  };
}

export async function setRole(role: "client" | "talent" | "company") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
}

export async function updateProfile(data: { 
  name: string; 
  bio?: string;
  skills?: string;
  location?: string;
  website?: string;
  companyName?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(user)
    .set({ 
      ...data,
      updatedAt: new Date() 
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}
