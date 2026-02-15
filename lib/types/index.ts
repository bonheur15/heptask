import { InferSelectModel } from "drizzle-orm";
import {
  user,
  project,
  milestone,
  applicant,
  ndaSignature,
  projectFile,
  notification,
  projectMessage,
  deliverySubmission,
  escrowTransaction,
  payoutTransaction,
  withdrawalRequest,
  companyTeam,
  companyInvite,
  companyAssignment,
  companyAutoApply,
  companyPriorityInterest,
  projectPublicationPayment,
} from "@/db/schema";
import { ProjectPlan as AiProjectPlanType } from "@/lib/ai/prompts"; // Import AI Plan type

export type User = InferSelectModel<typeof user>;
export type Project = InferSelectModel<typeof project>;
export type Milestone = InferSelectModel<typeof milestone>;
export type Applicant = InferSelectModel<typeof applicant>;
export type NdaSignature = InferSelectModel<typeof ndaSignature>;
export type ProjectFile = InferSelectModel<typeof projectFile>;
export type Notification = InferSelectModel<typeof notification>;
export type ProjectMessage = InferSelectModel<typeof projectMessage>;
export type DeliverySubmission = InferSelectModel<typeof deliverySubmission>;
export type EscrowTransaction = InferSelectModel<typeof escrowTransaction>;
export type PayoutTransaction = InferSelectModel<typeof payoutTransaction>;
export type WithdrawalRequest = InferSelectModel<typeof withdrawalRequest>;
export type CompanyTeam = InferSelectModel<typeof companyTeam>;
export type CompanyInvite = InferSelectModel<typeof companyInvite>;
export type CompanyAssignment = InferSelectModel<typeof companyAssignment>;
export type CompanyAutoApply = InferSelectModel<typeof companyAutoApply>;
export type CompanyPriorityInterest = InferSelectModel<typeof companyPriorityInterest>;
export type ProjectPublicationPayment = InferSelectModel<typeof projectPublicationPayment>;
export type AiAnalysis = {
  score: number;
  strengths: string[];
  risks: string[];
  verdict: string;
};
export type ProjectPlan = AiProjectPlanType;
