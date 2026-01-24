"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { applicant, project, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { askGemini } from "@/lib/ai/gemini";
import { AiModelId } from "@/lib/ai/models";

export async function getApplicantDetails(
  projectId: string,
  applicantId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const data = await db.query.applicant.findFirst({
    where: eq(applicant.id, applicantId),
    with: {
      user: true,
      project: true,
    },
  });

  if (!data || data.project.clientId !== session.user.id) {
    throw new Error("Applicant not found or access denied");
  }

  return data;
}

export async function getAiMatchAnalysis(
  projectId: string,
  applicantId: string,
  modelId: AiModelId = "gemini-2.5-flash-lite-preview-09-2025",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const appData = await db.query.applicant.findFirst({
    where: eq(applicant.id, applicantId),
    with: {
      user: true,
      project: true,
    },
  });

  if (!appData) throw new Error("Not found");

  const systemPrompt = `
    You are an expert technical recruiter and talent matcher.
    Analyze the project requirements and the talent's proposal/profile.

    Provide:
    1. Match Score (0-100).
    2. Key Strengths: Why they are a good fit.
    3. Potential Risks: Any missing skills or concerns.
    4. Technical Verdict: Is their proposed tech stack/approach optimal?

    Return strictly as JSON:
    {
      "score": number,
      "strengths": ["string"],
      "risks": ["string"],
      "verdict": "string"
    }
  `;

  const userPrompt = `
    Project: ${appData.project.title}
    Project Plan: ${appData.project.plan}

    Talent Name: ${appData.user.name}
    Talent Bio: ${appData.user.bio}
    Talent Skills: ${appData.user.skills}

    Talent Proposal: ${appData.proposal}
    Proposed Milestones: ${appData.proposedMilestones}
  `;

  return askGemini(modelId, systemPrompt, userPrompt);
}
