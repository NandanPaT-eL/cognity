-- Migration: replace selector + fallback_selectors with fingerprint on tour_steps
-- Existing steps are incompatible with the new format — delete them all first.

DELETE FROM "tour_steps";

ALTER TABLE "tour_steps"
  DROP COLUMN IF EXISTS "selector",
  DROP COLUMN IF EXISTS "fallback_selectors",
  ADD COLUMN "fingerprint" text NOT NULL;
