import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role"), // 'client' | 'talent' | 'company'
  bio: text("bio"),
  skills: text("skills"), // Store as comma separated or JSON string
  location: text("location"),
  website: text("website"),
  companyName: text("company_name"),
  accountTier: text("account_tier").notNull().default("free"), // free, pro, enterprise
  accountTierStatus: text("account_tier_status").notNull().default("active"), // active, processing, requires_payment
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  clientProjects: many(project, { relationName: "clientProjects" }), // Client's projects
  talentProjects: many(project, { relationName: "talentProjects" }), // Projects where user is talent
  applications: many(applicant), // Applications made by the user
  ndaSignatures: many(ndaSignature),
  uploadedFiles: many(projectFile),
  escrow: one(escrow, {
    fields: [user.id],
    references: [escrow.userId],
  }),
  notifications: many(notification),
  publicationPayments: many(projectPublicationPayment),
  accountUpgradePayments: many(accountUpgradePayment),
  brainstormSessions: many(projectBrainstormSession),
}));

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("draft"), // draft, active, maintenance, completed, cancelled
  clientId: text("client_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  talentId: text("talent_id").references(() => user.id),
  budget: text("budget"),
  deadline: timestamp("deadline"),
  plan: text("plan"), // JSON string or text for AI generated plan
  publishedAt: timestamp("published_at"),
  companyExclusiveUntil: timestamp("company_exclusive_until"),
  ndaRequired: boolean("nda_required").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const projectPublicationPayment = pgTable("project_publication_payment", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  txRef: text("tx_ref").notNull().unique(),
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("processing"), // processing, paid, failed
  projectPayload: text("project_payload").notNull(),
  paymentLink: text("payment_link"),
  flutterwaveTransactionId: text("flutterwave_transaction_id"),
  projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const projectBrainstormSession = pgTable("project_brainstorm_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  objective: text("objective"),
  modelId: text("model_id").notNull().default("gemini-2.5-flash-lite-preview-09-2025"),
  mode: text("mode").notNull().default("advanced"), // fast, advanced
  status: text("status").notNull().default("active"), // active, archived, converted
  sourceLinks: text("source_links"), // JSON array of strings
  draftTitle: text("draft_title"),
  draftDescription: text("draft_description"),
  draftBudget: text("draft_budget"),
  draftDeadline: timestamp("draft_deadline"),
  draftPlan: text("draft_plan"), // JSON string of ProjectPlan
  lastAssistantSummary: text("last_assistant_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const projectBrainstormMessage = pgTable("project_brainstorm_message", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => projectBrainstormSession.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user, assistant, system
  tool: text("tool"), // scope, technical, budget, timeline, risks, references
  body: text("body").notNull(),
  references: text("references"), // JSON array [{ title, url, note }]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountUpgradePayment = pgTable("account_upgrade_payment", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  txRef: text("tx_ref").notNull().unique(),
  targetTier: text("target_tier").notNull(), // pro, enterprise
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("processing"), // processing, paid, failed
  paymentLink: text("payment_link"),
  flutterwaveTransactionId: text("flutterwave_transaction_id"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const milestone = pgTable("milestone", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  amount: text("amount"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, approved
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicant = pgTable("applicant", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  proposal: text("proposal").notNull(),
  budget: text("budget"),
  timeline: text("timeline"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  ndaSigned: boolean("nda_signed").default(false).notNull(),
  proposedMilestones: text("proposed_milestones"), // JSON string of milestones
  relevantLinks: text("relevant_links"),
  aiAnalysis: text("ai_analysis"), // Persisted AI match analysis JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectFile = pgTable("project_file", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: text("size"),
  type: text("type"), // document, sketch, audio
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectMessage = pgTable("project_message", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => user.id),
  role: text("role").notNull(), // client, talent, system
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliverySubmission = pgTable("delivery_submission", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  milestoneId: text("milestone_id").references(() => milestone.id),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => user.id),
  summary: text("summary").notNull(),
  link: text("link"),
  fileId: text("file_id").references(() => projectFile.id),
  status: text("status").notNull().default("pending"), // pending, approved, revision
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const escrow = pgTable("escrow", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: text("balance").notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const escrowTransaction = pgTable("escrow_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // deposit, milestone_release, manual_release, refund
  amount: text("amount").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payoutTransaction = pgTable("payout_transaction", {
  id: text("id").primaryKey(),
  talentId: text("talent_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // milestone_release, manual_release
  amount: text("amount").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyTeam = pgTable("company_team", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member
  status: text("status").notNull().default("active"), // active, pending, removed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyInvite = pgTable("company_invite", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  token: text("token").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyAssignment = pgTable("company_assignment", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  allocation: text("allocation").default("0"),
  status: text("status").notNull().default("assigned"), // assigned, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companyAutoApply = pgTable("company_auto_apply", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  focusSkills: text("focus_skills"),
  minBudget: text("min_budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const companyPriorityInterest = pgTable("company_priority_interest", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("applied"), // applied, reviewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const withdrawalRequest = pgTable("withdrawal_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(),
  method: text("method").notNull(), // bank, card, crypto
  status: text("status").notNull().default("pending"), // pending, processing, approved, rejected, paid
  currency: text("currency").default("USD"),
  accountBank: text("account_bank"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  flutterwaveTransferId: text("flutterwave_transfer_id"),
  flutterwaveReference: text("flutterwave_reference"),
  processingError: text("processing_error"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // project_update, message, payment, system
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dispute = pgTable("dispute", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("open"), // open, resolved, closed
  reason: text("reason").notNull(),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectRelations = relations(project, ({ one, many }) => ({
  client: one(user, {
    fields: [project.clientId],
    references: [user.id],
    relationName: "clientProjects",
  }),
  talent: one(user, {
    fields: [project.talentId],
    references: [user.id],
    relationName: "talentProjects",
  }),
  milestones: many(milestone),
  applicants: many(applicant),
  files: many(projectFile),
  messages: many(projectMessage),
  deliveries: many(deliverySubmission),
  escrowTransactions: many(escrowTransaction),
  payoutTransactions: many(payoutTransaction),
  companyAssignments: many(companyAssignment),
  companyPriorityInterests: many(companyPriorityInterest),
  publicationPayments: many(projectPublicationPayment),
  disputes: many(dispute),
}));

export const projectPublicationPaymentRelations = relations(projectPublicationPayment, ({ one }) => ({
  user: one(user, {
    fields: [projectPublicationPayment.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [projectPublicationPayment.projectId],
    references: [project.id],
  }),
}));

export const accountUpgradePaymentRelations = relations(accountUpgradePayment, ({ one }) => ({
  user: one(user, {
    fields: [accountUpgradePayment.userId],
    references: [user.id],
  }),
}));

export const projectBrainstormSessionRelations = relations(projectBrainstormSession, ({ one, many }) => ({
  user: one(user, {
    fields: [projectBrainstormSession.userId],
    references: [user.id],
  }),
  messages: many(projectBrainstormMessage),
}));

export const projectBrainstormMessageRelations = relations(projectBrainstormMessage, ({ one }) => ({
  session: one(projectBrainstormSession, {
    fields: [projectBrainstormMessage.sessionId],
    references: [projectBrainstormSession.id],
  }),
}));

export const milestoneRelations = relations(milestone, ({ one }) => ({
  project: one(project, {
    fields: [milestone.projectId],
    references: [project.id],
  }),
}));

export const applicantRelations = relations(applicant, ({ one }) => ({
  project: one(project, {
    fields: [applicant.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [applicant.userId],
    references: [user.id],
  }),
}));

export const projectFileRelations = relations(projectFile, ({ one }) => ({
  project: one(project, {
    fields: [projectFile.projectId],
    references: [project.id],
  }),
  uploader: one(user, {
    fields: [projectFile.uploadedBy],
    references: [user.id],
  }),
}));

export const projectMessageRelations = relations(projectMessage, ({ one }) => ({
  project: one(project, {
    fields: [projectMessage.projectId],
    references: [project.id],
  }),
  sender: one(user, {
    fields: [projectMessage.senderId],
    references: [user.id],
  }),
}));

export const deliverySubmissionRelations = relations(deliverySubmission, ({ one }) => ({
  project: one(project, {
    fields: [deliverySubmission.projectId],
    references: [project.id],
  }),
  milestone: one(milestone, {
    fields: [deliverySubmission.milestoneId],
    references: [milestone.id],
  }),
  submitter: one(user, {
    fields: [deliverySubmission.submittedBy],
    references: [user.id],
  }),
  file: one(projectFile, {
    fields: [deliverySubmission.fileId],
    references: [projectFile.id],
  }),
}));

export const escrowRelations = relations(escrow, ({ one }) => ({
  user: one(user, {
    fields: [escrow.userId],
    references: [user.id],
  }),
}));

export const escrowTransactionRelations = relations(escrowTransaction, ({ one }) => ({
  user: one(user, {
    fields: [escrowTransaction.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [escrowTransaction.projectId],
    references: [project.id],
  }),
}));

export const payoutTransactionRelations = relations(payoutTransaction, ({ one }) => ({
  talent: one(user, {
    fields: [payoutTransaction.talentId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [payoutTransaction.projectId],
    references: [project.id],
  }),
}));

export const withdrawalRequestRelations = relations(withdrawalRequest, ({ one }) => ({
  user: one(user, {
    fields: [withdrawalRequest.userId],
    references: [user.id],
  }),
}));

export const companyTeamRelations = relations(companyTeam, ({ one }) => ({
  company: one(user, {
    fields: [companyTeam.companyId],
    references: [user.id],
  }),
  member: one(user, {
    fields: [companyTeam.memberId],
    references: [user.id],
  }),
}));

export const companyInviteRelations = relations(companyInvite, ({ one }) => ({
  company: one(user, {
    fields: [companyInvite.companyId],
    references: [user.id],
  }),
}));

export const companyAssignmentRelations = relations(companyAssignment, ({ one }) => ({
  project: one(project, {
    fields: [companyAssignment.projectId],
    references: [project.id],
  }),
  member: one(user, {
    fields: [companyAssignment.memberId],
    references: [user.id],
  }),
}));

export const companyAutoApplyRelations = relations(companyAutoApply, ({ one }) => ({
  company: one(user, {
    fields: [companyAutoApply.companyId],
    references: [user.id],
  }),
}));

export const companyPriorityInterestRelations = relations(companyPriorityInterest, ({ one }) => ({
  company: one(user, {
    fields: [companyPriorityInterest.companyId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [companyPriorityInterest.projectId],
    references: [project.id],
  }),
}));
export const ndaSignature = pgTable("nda_signature", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export const ndaSignatureRelations = relations(ndaSignature, ({ one }) => ({
  project: one(project, {
    fields: [ndaSignature.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [ndaSignature.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
