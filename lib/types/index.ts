import { InferSelectModel } from "drizzle-orm";
import { user, project, milestone, applicant, ndaSignature, projectFile, notification } from "@/db/schema";
import { ProjectPlan as AiProjectPlanType } from "@/lib/ai/prompts"; // Import AI Plan type

export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof project>;
export type Milestone = InferSelectModel<typeof milestone>;
export type Applicant = InferSelectModel<typeof applicant>;
export type NdaSignature = InferSelectModel<typeof ndaSignature>;
export type ProjectFile = InferSelectModel<typeof projectFile>;
export type Notification = InferSelectModel<typeof notification>;
export type AiAnalysis = {
  score: number;
  strengths: string[];
  risks: string[];
  verdict: string;
};
export type ProjectPlan = AiProjectPlanType;