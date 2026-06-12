-- Add clerk_user_id to organizations for personal-account auth (V1 beta)
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "clerk_user_id" text UNIQUE;

CREATE INDEX IF NOT EXISTS "idx_orgs_clerk_user_id" ON "organizations" ("clerk_user_id");
