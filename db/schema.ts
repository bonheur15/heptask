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
  projects: many(project, { relationName: "clientProjects" }),
  assignedProjects: many(project, { relationName: "talentProjects" }),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
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
  disputes: many(dispute),
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
