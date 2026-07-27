-- Link transactions to goals (avoid double-counting savings + goal contributions).
-- Run in Supabase SQL Editor after phase2_finance.sql

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON transactions (goal_id);

ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS source_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contributions_source_transaction ON contributions (source_transaction_id);
