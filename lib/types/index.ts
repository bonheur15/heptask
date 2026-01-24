export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  bio?: string | null;
  skills?: string | null;
  location?: string | null;
  website?: string | null;
  companyName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  clientProjects?: Project[];
  talentProjects?: Project[];
  applications?: Applicant[];
  ndaSignatures?: NdaSignature[];
  uploadedFiles?: ProjectFile[];
};

export type NdaSignature = {
  id: string;
  projectId: string;
  userId: string;
  signedAt: Date;
  project?: Project;
  user?: User;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  amount?: string | null;
  status: string;
  dueDate?: Date | null;
  createdAt: Date;
  project?: Project;
};

export type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  url: string;
  size?: string | null;
  type?: string | null;
  uploadedBy: string;
  createdAt: Date;
  uploader?: User;
  project?: Project;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  clientId: string;
  talentId?: string | null;
  budget?: string | null;
  deadline?: Date | null;
  plan?: string | null;
  ndaRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  client?: User;
  talent?: User | null;
  milestones?: Milestone[];
  applicants?: Applicant[];
  files?: ProjectFile[];
};

export type Applicant = {
  id: string;
  projectId: string;
  userId: string;
  proposal: string;
  budget?: string | null;
  timeline?: string | null;
  status: string;
  ndaSigned: boolean;
  proposedMilestones?: string | null;
  relevantLinks?: string | null;
  aiAnalysis?: string | null;
  createdAt: Date;
  user?: User;
  project?: Project;
};

export type AiAnalysis = {
  score: number;
  strengths: string[];
  risks: string[];
  verdict: string;
};

export type ProjectPlan = {
  summary: string;
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
  timeline: string;
};
