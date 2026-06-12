CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "plan" text DEFAULT 'free' NOT NULL,
  "api_key" text NOT NULL UNIQUE,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "activation_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "event_name" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "activation_goals_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "parsed_text" text,
  "embedding_status" text DEFAULT 'pending',
  "chunk_count" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "documents_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "end_user_id" text NOT NULL,
  "goal_text" text,
  "status" text DEFAULT 'active',
  "activated_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "chat_sessions_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "messages_session_id_chat_sessions_id_fk"
    FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "org_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "page_path" text,
  "metadata" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "activity_events_session_id_chat_sessions_id_fk"
    FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id"),
  CONSTRAINT "activity_events_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
);

CREATE INDEX IF NOT EXISTS "idx_sessions_org_id" ON "chat_sessions" ("org_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_status" ON "chat_sessions" ("org_id", "status");
CREATE INDEX IF NOT EXISTS "idx_events_org_type" ON "activity_events" ("org_id", "event_type");
CREATE INDEX IF NOT EXISTS "idx_events_session" ON "activity_events" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_messages_session" ON "messages" ("session_id", "created_at" DESC);
