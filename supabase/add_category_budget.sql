-- Monthly spending budget per expense category
-- Run in Supabase SQL Editor (after phase2_finance.sql)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS monthly_budget numeric NOT NULL DEFAULT 0
    CHECK (monthly_budget >= 0);
