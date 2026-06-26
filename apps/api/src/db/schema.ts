import { pgTable, uuid, text, timestamp, jsonb, integer, uniqueIndex } from 'drizzle-orm/pg-core'

export const organizations = pgTable('organizations', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  clerk_user_id:          text('clerk_user_id').unique(),
  name:                   text('name').notNull(),
  plan:                   text('plan').notNull().default('free'),
  stripe_customer_id:     text('stripe_customer_id').unique(),
  stripe_subscription_id: text('stripe_subscription_id').unique().$type<string | null>(),  // nullable — NOT NULL dropped in migration 0005
  plan_expires_at:        timestamp('plan_expires_at', { withTimezone: true }),
  api_key:                text('api_key').notNull().unique(),
  // Array of allowed Origin domains for SDK key validation.
  // Empty array = no restriction (all origins allowed).
  allowed_origins:        text('allowed_origins').array().notNull().default([]),
  created_at:             timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:             timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const activationGoals = pgTable('activation_goals', {
  id:          uuid('id').primaryKey().defaultRandom(),
  org_id:      uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  event_name:  text('event_name').notNull(),
  description: text('description').notNull(),
  created_at:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const documents = pgTable('documents', {
  id:               uuid('id').primaryKey().defaultRandom(),
  org_id:           uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  file_name:        text('file_name').notNull(),
  file_url:         text('file_url').notNull(),
  parsed_text:      text('parsed_text'),
  embedding_status: text('embedding_status').default('pending'),
  chunk_count:      integer('chunk_count').default(0),
  created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const sessions = pgTable('chat_sessions', {
  id:           uuid('id').primaryKey().defaultRandom(),
  org_id:       uuid('org_id').notNull().references(() => organizations.id),
  end_user_id:  text('end_user_id').notNull(),
  goal_text:    text('goal_text'),
  status:       text('status').default('active'),
  activated_at: timestamp('activated_at', { withTimezone: true }),
  created_at:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const messages = pgTable('messages', {
  id:         uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  role:       text('role').notNull(),
  content:    text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const activityEvents = pgTable('activity_events', {
  id:         uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').notNull().references(() => sessions.id),
  org_id:     uuid('org_id').notNull().references(() => organizations.id),
  event_type: text('event_type').notNull(),
  page_path:  text('page_path'),
  metadata:   jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

// ─── Usage tracking ──────────────────────────────────────────────────────────

/**
 * One row per org per calendar month.
 * trigger_count increments on every AI message; mau_count mirrors distinct mau_users.
 */
export const usageCounters = pgTable(
  'usage_counters',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    org_id:        uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    /** YYYY-MM string, e.g. "2026-06" */
    month:         text('month').notNull(),
    trigger_count: integer('trigger_count').notNull().default(0),
    mau_count:     integer('mau_count').notNull().default(0),
  },
  (t) => ({
    org_month_unique: uniqueIndex('usage_counters_org_month_idx').on(t.org_id, t.month),
  })
)

/**
 * One row per unique (org, end_user, month) triplet.
 * Used to count and enforce monthly-active-user limits.
 */
export const mauUsers = pgTable(
  'mau_users',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    org_id:      uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    end_user_id: text('end_user_id').notNull(),
    /** YYYY-MM string */
    month:       text('month').notNull(),
    first_seen:  timestamp('first_seen', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    org_user_month_unique: uniqueIndex('mau_users_org_user_month_idx').on(t.org_id, t.end_user_id, t.month),
  })
)
