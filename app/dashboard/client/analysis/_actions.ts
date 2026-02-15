"use server";

import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  project,
  projectBrainstormMessage,
  projectBrainstormSession,
  user,
} from "@/db/schema";
import { AiModelId } from "@/lib/ai/models";
import { ProjectPlan } from "@/lib/types";
import { generateBrainstormReply } from "@/lib/ai/brainstorm";
import { startPublicationCheckoutForProject } from "../projects/create/_actions";

type SessionMode = "fast" | "advanced";
type BrainstormTool = "scope" | "technical" | "budget" | "timeline" | "risks" | "references";
type AccountTier = "free" | "pro" | "enterprise";

const TIER_LIMITS: Record<AccountTier, { maxSessions: number; maxMessagesPerSession: number; tools: BrainstormTool[] }> = {
  free: {
    maxSessions: 3,
    maxMessagesPerSession: 30,
    tools: ["scope", "budget", "timeline"],
  },
  pro: {
    maxSessions: 20,
    maxMessagesPerSession: 200,
    tools: ["scope", "technical", "budget", "timeline", "risks", "references"],
  },
  enterprise: {
    maxSessions: 100,
    maxMessagesPerSession: 800,
    tools: ["scope", "technical", "budget", "timeline", "risks", "references"],
  },
};

const emptyPlan = (): ProjectPlan => ({
  summary: "",
  deliverables: [],
  milestones: [],
  technicalSpecs: [],
  risks: [],
  successMetrics: [],
  timeline: "",
});

const parseStoredPlan = (raw: string | null): ProjectPlan => {
  if (!raw) return emptyPlan();
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectPlan>;
    return {
      summary: parsed.summary ?? "",
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
      technicalSpecs: Array.isArray(parsed.technicalSpecs) ? parsed.technicalSpecs : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : [],
      timeline: parsed.timeline ?? "",
    };
  } catch {
    return emptyPlan();
  }
};

const parseLinks = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const resolveTier = (tier: string | null | undefined): AccountTier => {
  if (tier === "pro" || tier === "enterprise") return tier;
  return "free";
};

const assertClientSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== "client") {
    throw new Error("Unauthorized");
  }
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  if (!currentUser) throw new Error("User not found.");
  return { session, currentUser, tier: resolveTier(currentUser.accountTier) };
};

const normalizeBudget = (budget: string) => {
  const numeric = Number.parseFloat((budget ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric.toFixed(2) : "";
};

export async function getAnalysisWorkspaceData(sessionId?: string) {
  const { session, tier } = await assertClientSession();

  const sessions = await db.query.projectBrainstormSession.findMany({
    where: eq(projectBrainstormSession.userId, session.user.id),
    orderBy: desc(projectBrainstormSession.updatedAt),
    limit: 50,
  });

  const activeSession = sessionId
    ? sessions.find((item) => item.id === sessionId)
    : sessions[0];

  const messages = activeSession
    ? await db.query.projectBrainstormMessage.findMany({
      where: eq(projectBrainstormMessage.sessionId, activeSession.id),
      orderBy: desc(projectBrainstormMessage.createdAt),
      limit: 120,
    })
    : [];

  return {
    tier,
    limits: TIER_LIMITS[tier],
    sessions,
    activeSession: activeSession
      ? {
        ...activeSession,
        links: parseLinks(activeSession.sourceLinks),
        plan: parseStoredPlan(activeSession.draftPlan),
      }
      : null,
    messages: messages.reverse().map((msg) => ({
      ...msg,
      refs: (() => {
        if (!msg.references) return [];
        try {
          const parsed = JSON.parse(msg.references) as Array<{ title: string; url: string; note: string }>;
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
    })),
  };
}

export async function createAnalysisSession(payload?: {
  title?: string;
  objective?: string;
  modelId?: AiModelId;
  mode?: SessionMode;
}) {
  const { session, tier } = await assertClientSession();

  const existingSessions = await db.query.projectBrainstormSession.findMany({
    where: eq(projectBrainstormSession.userId, session.user.id),
    limit: TIER_LIMITS[tier].maxSessions + 1,
  });

  if (existingSessions.length >= TIER_LIMITS[tier].maxSessions) {
    throw new Error(`Your ${tier.toUpperCase()} tier allows up to ${TIER_LIMITS[tier].maxSessions} analysis sessions.`);
  }

  const id = nanoid();
  await db.insert(projectBrainstormSession).values({
    id,
    userId: session.user.id,
    title: payload?.title?.trim() || "Untitled analysis",
    objective: payload?.objective?.trim() || "",
    modelId: payload?.modelId || "gemini-2.5-flash-lite-preview-09-2025",
    mode: payload?.mode || "advanced",
    sourceLinks: JSON.stringify([]),
    draftPlan: JSON.stringify(emptyPlan()),
  });

  await db.insert(projectBrainstormMessage).values({
    id: nanoid(),
    sessionId: id,
    role: "system",
    body: "Analysis session created. Share your goal, constraints, and references to build a production-ready project brief.",
  });

  revalidatePath("/dashboard/client/analysis");
  revalidatePath("/dashboard/client");
  return { sessionId: id };
}

export async function sendAnalysisMessage(payload: {
  sessionId: string;
  message: string;
  tool: BrainstormTool;
}) {
  const { session, tier } = await assertClientSession();
  const limits = TIER_LIMITS[tier];

  if (!limits.tools.includes(payload.tool)) {
    throw new Error(`"${payload.tool}" tool requires a higher tier. Upgrade in Billing & Plans.`);
  }

  const targetSession = await db.query.projectBrainstormSession.findFirst({
    where: and(
      eq(projectBrainstormSession.id, payload.sessionId),
      eq(projectBrainstormSession.userId, session.user.id),
    ),
  });

  if (!targetSession) throw new Error("Analysis session not found.");
  if (!payload.message.trim()) throw new Error("Message cannot be empty.");

  const existingMessages = await db.query.projectBrainstormMessage.findMany({
    where: eq(projectBrainstormMessage.sessionId, payload.sessionId),
    orderBy: desc(projectBrainstormMessage.createdAt),
    limit: limits.maxMessagesPerSession + 1,
  });

  if (existingMessages.length >= limits.maxMessagesPerSession) {
    throw new Error(`Session limit reached for ${tier.toUpperCase()} (${limits.maxMessagesPerSession} messages).`);
  }

  await db.insert(projectBrainstormMessage).values({
    id: nanoid(),
    sessionId: payload.sessionId,
    role: "user",
    tool: payload.tool,
    body: payload.message.trim(),
  });

  const conversation = existingMessages
    .slice(0, 20)
    .reverse()
    .filter((item): item is typeof item & { role: "user" | "assistant" } => item.role === "user" || item.role === "assistant")
    .map((item) => ({
      role: item.role,
      body: item.body,
    }));

  const existingPlan = parseStoredPlan(targetSession.draftPlan);
  const ai = await generateBrainstormReply({
    modelId: targetSession.modelId as AiModelId,
    tool: payload.tool,
    mode: (targetSession.mode as SessionMode) || "advanced",
    objective: targetSession.objective || "",
    draft: {
      title: targetSession.draftTitle,
      description: targetSession.draftDescription,
      budget: targetSession.draftBudget,
      plan: existingPlan,
    },
    conversation,
    latestUserMessage: payload.message.trim(),
  });

  const updatedPlan: ProjectPlan = {
    summary: ai.draftProject.description || existingPlan.summary,
    deliverables: ai.draftProject.deliverables.length > 0 ? ai.draftProject.deliverables : existingPlan.deliverables,
    milestones: ai.draftProject.milestones.length > 0 ? ai.draftProject.milestones : existingPlan.milestones,
    technicalSpecs: ai.draftProject.technicalSpecs.length > 0 ? ai.draftProject.technicalSpecs : existingPlan.technicalSpecs,
    risks: ai.draftProject.risks.length > 0 ? ai.draftProject.risks : existingPlan.risks,
    successMetrics: ai.draftProject.successMetrics.length > 0 ? ai.draftProject.successMetrics : existingPlan.successMetrics,
    timeline: ai.draftProject.timeline || existingPlan.timeline,
  };

  const mentionedUrls = Array.from(new Set(payload.message.match(/https?:\/\/[^\s)]+/g) ?? []));
  const currentLinks = parseLinks(targetSession.sourceLinks);
  const aiUrls = ai.references.map((item) => item.url);
  const mergedLinks = Array.from(new Set([...currentLinks, ...mentionedUrls, ...aiUrls])).slice(0, 100);

  await db.insert(projectBrainstormMessage).values({
    id: nanoid(),
    sessionId: payload.sessionId,
    role: "assistant",
    tool: payload.tool,
    body: ai.assistantReply,
    references: JSON.stringify(ai.references),
  });

  await db.update(projectBrainstormSession).set({
    title: ai.draftProject.title || targetSession.title,
    draftTitle: ai.draftProject.title || targetSession.draftTitle,
    draftDescription: ai.draftProject.description || targetSession.draftDescription,
    draftBudget: normalizeBudget(ai.draftProject.budget) || targetSession.draftBudget,
    draftPlan: JSON.stringify(updatedPlan),
    sourceLinks: JSON.stringify(mergedLinks),
    lastAssistantSummary: ai.summary,
    updatedAt: new Date(),
  }).where(eq(projectBrainstormSession.id, payload.sessionId));

  revalidatePath("/dashboard/client/analysis");
  return { ok: true };
}

export async function updateAnalysisSessionDraft(payload: {
  sessionId: string;
  title: string;
  objective: string;
  budget: string;
  deadline?: string;
  mode: SessionMode;
  modelId: AiModelId;
}) {
  const { session } = await assertClientSession();
  const target = await db.query.projectBrainstormSession.findFirst({
    where: and(
      eq(projectBrainstormSession.id, payload.sessionId),
      eq(projectBrainstormSession.userId, session.user.id),
    ),
  });
  if (!target) throw new Error("Analysis session not found.");

  await db.update(projectBrainstormSession).set({
    title: payload.title.trim() || target.title,
    objective: payload.objective.trim(),
    draftTitle: payload.title.trim() || target.draftTitle,
    draftBudget: normalizeBudget(payload.budget) || target.draftBudget,
    draftDeadline: payload.deadline ? new Date(payload.deadline) : target.draftDeadline,
    mode: payload.mode,
    modelId: payload.modelId,
    updatedAt: new Date(),
  }).where(eq(projectBrainstormSession.id, payload.sessionId));

  revalidatePath("/dashboard/client/analysis");
}

export async function convertAnalysisToProject(payload: {
  sessionId: string;
  action: "draft" | "publish";
}) {
  const { session } = await assertClientSession();

  const target = await db.query.projectBrainstormSession.findFirst({
    where: and(
      eq(projectBrainstormSession.id, payload.sessionId),
      eq(projectBrainstormSession.userId, session.user.id),
    ),
  });

  if (!target) throw new Error("Analysis session not found.");

  const title = (target.draftTitle || target.title || "").trim();
  const description = (target.draftDescription || target.objective || "").trim();
  const budget = normalizeBudget(target.draftBudget || "");
  const plan = parseStoredPlan(target.draftPlan);

  if (!title || !description || !budget) {
    throw new Error("Draft is incomplete. Add title, description, and budget before converting.");
  }

  const projectId = nanoid();
  await db.insert(project).values({
    id: projectId,
    clientId: session.user.id,
    title,
    description,
    budget,
    deadline: target.draftDeadline,
    status: "draft",
    plan: JSON.stringify({
      ...plan,
      summary: plan.summary || description,
    }),
  });

  await db.update(projectBrainstormSession).set({
    status: "converted",
    updatedAt: new Date(),
  }).where(eq(projectBrainstormSession.id, payload.sessionId));

  if (payload.action === "publish") {
    const checkout = await startPublicationCheckoutForProject(projectId);
    revalidatePath("/dashboard/client");
    return { projectId, checkoutUrl: checkout.checkoutUrl };
  }

  revalidatePath("/dashboard/client");
  return { projectId };
}
