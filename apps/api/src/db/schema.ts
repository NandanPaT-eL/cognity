import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core'

export const organizations = pgTable('organizations', {
  id:             uuid('id').primaryKey().defaultRandom(),
  clerk_user_id:  text('clerk_user_id').unique(),
  name:           text('name').notNull(),
  plan:           text('plan').notNull().default('free'),
  api_key:        text('api_key').notNull().unique(),
  created_at:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
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
