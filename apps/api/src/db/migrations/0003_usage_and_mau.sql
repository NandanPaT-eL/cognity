ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "allowed_origins" text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "usage_counters" (
  "id"            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id"        uuid        NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "month"         text        NOT NULL,
  "trigger_count" integer     NOT NULL DEFAULT 0,
  "mau_count"     integer     NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS "usage_counters_org_month_idx"
  ON "usage_counters" ("org_id", "month");

CREATE TABLE IF NOT EXISTS "mau_users" (
  "id"           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "org_id"       uuid        NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "end_user_id"  text        NOT NULL,
  "month"        text        NOT NULL,
  "first_seen"   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "mau_users_org_user_month_idx"
  ON "mau_users" ("org_id", "end_user_id", "month");
