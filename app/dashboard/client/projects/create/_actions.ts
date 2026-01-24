"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { AiModelId } from "@/lib/ai/models";
import { ProjectPlan } from "@/lib/types";
import {
  generateProjectQuestions,
  generateProjectPlanDetails,
} from "@/lib/ai/gemini";

export async function generateAiQuestions(
  idea: string,
  modelId: AiModelId = "gemini-2.5-flash-lite-preview-09-2025",
) {
  return generateProjectQuestions(modelId, idea);
}

export async function generateProjectPlan(data: {
  idea: string;
  answers: Record<string, string>;
  mode: "fast" | "advanced";
  modelId: AiModelId;
}) {
  return generateProjectPlanDetails(
    data.modelId,
    data.idea,
    data.answers,
    data.mode,
  );
}

export async function createFinalProject(data: {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  plan: ProjectPlan;
  status: "draft" | "active";
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const projectId = nanoid();

  await db.insert(project).values({
    id: projectId,
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: data.deadline ? new Date(data.deadline) : null,
    status: data.status,
    clientId: session.user.id,
    plan: JSON.stringify(data.plan),
  });

  revalidatePath("/dashboard/client");
  return { id: projectId };
}
