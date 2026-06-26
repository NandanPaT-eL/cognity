-- Add Stripe billing columns to organizations
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "stripe_customer_id"     text UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text UNIQUE,
  ADD COLUMN IF NOT EXISTS "plan_expires_at"        timestamptz;

-- Update plan column default to reflect new tiers
-- Existing rows keep 'free'; new tiers: free | beta | starter | growth | lifetime | enterprise
CREATE INDEX IF NOT EXISTS "idx_orgs_stripe_customer"     ON "organizations" ("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "idx_orgs_stripe_subscription" ON "organizations" ("stripe_subscription_id");
