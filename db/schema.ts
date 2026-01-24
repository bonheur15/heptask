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
  ndaRequired: boolean("nda_required").default(true).notNull(),
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
  disputes: many(dispute),
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
