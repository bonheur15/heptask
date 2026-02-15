import { AiModelId } from "@/lib/ai/models";
import { askGemini } from "@/lib/ai/gemini";
import { ProjectPlan } from "@/lib/ai/prompts";

export type BrainstormReference = {
  title: string;
  url: string;
  note: string;
};

export type BrainstormResponse = {
  assistantReply: string;
  summary: string;
  references: BrainstormReference[];
  draftProject: {
    title: string;
    description: string;
    budget: string;
    timeline: string;
    deliverables: string[];
    milestones: {
      title: string;
      description: string;
      duration: string;
    }[];
    technicalSpecs: {
      category: string;
      tech: string;
      reason: string;
    }[];
    risks: {
      risk: string;
      mitigation: string;
    }[];
    successMetrics: string[];
  };
};

const BRAINSTORM_PROMPT = `
You are Heptadev Project Analyst, a senior product strategist and delivery architect.
You help clients brainstorm and prepare project briefs for marketplace publishing.

Your goals:
1) Ask smart follow-up guidance and reduce ambiguity.
2) Produce practical project structure that can be converted directly to execution.
3) Return references only when you have meaningful URLs. If none, return [].
4) Keep advice realistic on budget, timeline, risks, and scope.

Tool intent meanings:
- scope: clarify requirements and user stories.
- technical: recommend architecture and stack.
- budget: estimate ranges and tradeoffs.
- timeline: define milestones and delivery sequencing.
- risks: identify delivery/security/ops risks + mitigations.
- references: provide links, standards, docs, examples, benchmarks.

Return STRICT JSON with this exact shape:
{
  "assistantReply": "string",
  "summary": "string",
  "references": [{ "title": "string", "url": "https://...", "note": "string" }],
  "draftProject": {
    "title": "string",
    "description": "string",
    "budget": "string",
    "timeline": "string",
    "deliverables": ["string"],
    "milestones": [{ "title": "string", "description": "string", "duration": "string" }],
    "technicalSpecs": [{ "category": "string", "tech": "string", "reason": "string" }],
    "risks": [{ "risk": "string", "mitigation": "string" }],
    "successMetrics": ["string"]
  }
}
`;

export async function generateBrainstormReply(input: {
  modelId: AiModelId;
  tool: "scope" | "technical" | "budget" | "timeline" | "risks" | "references";
  mode: "fast" | "advanced";
  objective: string;
  draft: {
    title?: string | null;
    description?: string | null;
    budget?: string | null;
    plan?: ProjectPlan | null;
  };
  conversation: Array<{ role: "user" | "assistant"; body: string }>;
  latestUserMessage: string;
}) {
  const context = {
    tool: input.tool,
    mode: input.mode,
    objective: input.objective,
    latestUserMessage: input.latestUserMessage,
    currentDraft: {
      title: input.draft.title ?? "",
      description: input.draft.description ?? "",
      budget: input.draft.budget ?? "",
      plan: input.draft.plan ?? null,
    },
    conversation: input.conversation.slice(-12),
  };

  const result = (await askGemini(
    input.modelId,
    BRAINSTORM_PROMPT,
    JSON.stringify(context),
  )) as Partial<BrainstormResponse>;

  return {
    assistantReply:
      typeof result.assistantReply === "string"
        ? result.assistantReply
        : "I analyzed your input and updated the draft plan. Continue by refining scope, budget, or references.",
    summary:
      typeof result.summary === "string" ? result.summary : "Draft updated from latest brainstorming message.",
    references: Array.isArray(result.references)
      ? result.references.filter(
        (item): item is BrainstormReference =>
          Boolean(item)
          && typeof item.title === "string"
          && typeof item.url === "string"
          && item.url.startsWith("http")
          && typeof item.note === "string",
      )
      : [],
    draftProject: {
      title: typeof result.draftProject?.title === "string" ? result.draftProject.title : "",
      description: typeof result.draftProject?.description === "string" ? result.draftProject.description : "",
      budget: typeof result.draftProject?.budget === "string" ? result.draftProject.budget : "",
      timeline: typeof result.draftProject?.timeline === "string" ? result.draftProject.timeline : "",
      deliverables: Array.isArray(result.draftProject?.deliverables)
        ? result.draftProject.deliverables.filter((item): item is string => typeof item === "string")
        : [],
      milestones: Array.isArray(result.draftProject?.milestones)
        ? result.draftProject.milestones.filter(
          (item): item is { title: string; description: string; duration: string } =>
            Boolean(item)
            && typeof item.title === "string"
            && typeof item.description === "string"
            && typeof item.duration === "string",
        )
        : [],
      technicalSpecs: Array.isArray(result.draftProject?.technicalSpecs)
        ? result.draftProject.technicalSpecs.filter(
          (item): item is { category: string; tech: string; reason: string } =>
            Boolean(item)
            && typeof item.category === "string"
            && typeof item.tech === "string"
            && typeof item.reason === "string",
        )
        : [],
      risks: Array.isArray(result.draftProject?.risks)
        ? result.draftProject.risks.filter(
          (item): item is { risk: string; mitigation: string } =>
            Boolean(item) && typeof item.risk === "string" && typeof item.mitigation === "string",
        )
        : [],
      successMetrics: Array.isArray(result.draftProject?.successMetrics)
        ? result.draftProject.successMetrics.filter((item): item is string => typeof item === "string")
        : [],
    },
  } satisfies BrainstormResponse;
}
