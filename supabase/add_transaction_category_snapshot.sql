-- Freeze category labels on transactions so edits/deletes to categories
-- do not change how past transactions appear.
-- Run in Supabase SQL Editor after phase2_finance.sql

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS category_name text,
  ADD COLUMN IF NOT EXISTS category_color text,
  ADD COLUMN IF NOT EXISTS category_is_savings boolean NOT NULL DEFAULT false;

UPDATE transactions t
SET
  category_name = c.name,
  category_color = c.color,
  category_is_savings = COALESCE(c.is_savings, false)
FROM categories c
WHERE t.category_id = c.id
  AND t.category_name IS NULL;
