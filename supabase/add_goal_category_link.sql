-- Link goals to savings expense categories so goals appear in the transaction category picker.
-- Run in Supabase SQL Editor after phase2_finance.sql and add_category_is_savings.sql

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS goal_id uuid REFERENCES goals(id) ON DELETE CASCADE;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS linked_category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_goal_id
  ON categories (goal_id)
  WHERE goal_id IS NOT NULL;

COMMENT ON COLUMN categories.goal_id IS
  'When set, this expense category represents a savings goal in the transaction picker.';

COMMENT ON COLUMN goals.linked_category_id IS
  'Savings expense category created for this goal (mirrors categories.goal_id).';
