import { pgTable, uuid, varchar, integer, timestamp, text, jsonb, boolean, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }),
  targetLevel: integer('target_level').notNull().default(1), // 1 or 2
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User-Company relationship (many-to-many)
export const userCompanies = pgTable('user_companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  role: varchar('role', { length: 50 }).default('member').notNull(), // owner, admin, member
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Control Progress table
export const controlProgress = pgTable('control_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  controlId: varchar('control_id', { length: 50 }).notNull(), // e.g., "AC.1.001"
  level: integer('level').notNull(), // 1 or 2
  status: varchar('status', { length: 50 }).default('not_started').notNull(), // not_started, in_progress, evidence_uploaded, ai_reviewing, approved, needs_rework
  completionPercentage: integer('completion_percentage').default(0).notNull(),
  evidenceCount: integer('evidence_count').default(0).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  notes: text('notes'),
});

// Evidence table
export const evidence = pgTable('evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  controlId: varchar('control_id', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: bigint('file_size', { mode: 'number' }),
  uploaderId: uuid('uploader_id').references(() => users.id).notNull(),
  aiReviewStatus: varchar('ai_review_status', { length: 50 }), // pending, approved, rejected
  aiFeedback: text('ai_feedback'),
  aiConfidence: integer('ai_confidence'), // 0-100
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
});

// Policies table
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  version: varchar('version', { length: 50 }).default('1.0').notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(), // draft, pending_approval, approved, archived
  controlIds: jsonb('control_ids'), // Array of control IDs this policy addresses
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  riskScore: integer('risk_score'), // 0-100
  assessmentStatus: varchar('assessment_status', { length: 50 }).default('pending').notNull(),
  hasAccess: boolean('has_access').default(false).notNull(),
  accessDetails: text('access_details'),
  contractStart: timestamp('contract_start'),
  contractEnd: timestamp('contract_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Training Sessions table
export const trainingSessions = pgTable('training_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('scheduled').notNull(), // scheduled, completed, cancelled
  scheduledDate: timestamp('scheduled_date'),
  completedDate: timestamp('completed_date'),
  instructorName: varchar('instructor_name', { length: 255 }),
  sessionType: varchar('session_type', { length: 50 }).default('live').notNull(), // live
  isFreeSession: boolean('is_free_session').default(true).notNull(),
  meetingUrl: text('meeting_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Integrations table
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  integrationType: varchar('integration_type', { length: 100 }).notNull(), // azure_ad, aws, intune, etc.
  credentialsEncrypted: text('credentials_encrypted'), // Encrypted credentials
  status: varchar('status', { length: 50 }).default('connected').notNull(), // connected, disconnected, error
  lastSyncAt: timestamp('last_sync_at'),
  errorMessage: text('error_message'),
  config: jsonb('config'), // Integration-specific configuration
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Monitoring Checks table
export const monitoringChecks = pgTable('monitoring_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  controlId: varchar('control_id', { length: 50 }).notNull(),
  checkType: varchar('check_type', { length: 100 }).notNull(), // automated, manual
  status: varchar('status', { length: 50 }).notNull(), // pass, fail, warning
  details: jsonb('details'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  achievementType: varchar('achievement_type', { length: 100 }).notNull(), // first_control, domain_complete, halfway_there, level_complete
  achievementData: jsonb('achievement_data'),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// Compliance Scores table
export const complianceScores = pgTable('compliance_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  level: integer('level').notNull(), // 1 or 2
  overallScore: integer('overall_score').notNull(), // 0-100
  domainScores: jsonb('domain_scores'), // {"Access Control": 85, "Audit": 90, ...}
  lastCalculated: timestamp('last_calculated').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userCompanies: many(userCompanies),
  evidence: many(evidence),
  trainingSessions: many(trainingSessions),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  userCompanies: many(userCompanies),
  controlProgress: many(controlProgress),
  evidence: many(evidence),
  policies: many(policies),
  vendors: many(vendors),
  trainingSessions: many(trainingSessions),
  integrations: many(integrations),
  monitoringChecks: many(monitoringChecks),
  achievements: many(achievements),
  complianceScores: many(complianceScores),
}));

export const userCompaniesRelations = relations(userCompanies, ({ one }) => ({
  user: one(users, {
    fields: [userCompanies.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [userCompanies.companyId],
    references: [companies.id],
  }),
}));

