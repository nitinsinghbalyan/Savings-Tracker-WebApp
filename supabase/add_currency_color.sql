-- ============================================================
-- Add currency + color to existing goals table
-- Run in Supabase → SQL Editor → New query → Run
-- Safe to run multiple times (IF NOT EXISTS)
-- ============================================================

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS color text DEFAULT 'indigo';

UPDATE goals SET currency = 'INR' WHERE currency IS NULL;
UPDATE goals SET color = 'indigo' WHERE color IS NULL;

ALTER TABLE goals
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN currency SET DEFAULT 'INR';

ALTER TABLE goals
  ALTER COLUMN color SET NOT NULL,
  ALTER COLUMN color SET DEFAULT 'indigo';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_currency_check'
  ) THEN
    ALTER TABLE goals
      ADD CONSTRAINT goals_currency_check CHECK (currency IN ('INR', 'USD'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_color_check'
  ) THEN
    ALTER TABLE goals
      ADD CONSTRAINT goals_color_check CHECK (color IN ('indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan'));
  END IF;
END $$;
