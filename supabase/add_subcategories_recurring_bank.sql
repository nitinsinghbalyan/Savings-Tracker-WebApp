-- ============================================================
-- Sub-categories, recurring transactions, bank icons on accounts
-- Run in Supabase SQL Editor AFTER phase2_finance.sql
-- ============================================================

-- Sub-categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (user_id, parent_id);

-- Bank slug on accounts
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS bank text
  CHECK (bank IS NULL OR bank IN ('icici', 'sbi', 'hdfc', 'axis', 'other'));

-- Recurring transaction rules
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id             uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  category_id            uuid REFERENCES categories(id) ON DELETE SET NULL,
  type                   text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount                 numeric NOT NULL CHECK (amount > 0),
  transfer_to_account_id uuid REFERENCES accounts(id) ON DELETE RESTRICT,
  note                   text,
  frequency              text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval_count         int NOT NULL DEFAULT 1 CHECK (interval_count >= 1),
  day_of_month           int CHECK (day_of_month BETWEEN 1 AND 31),
  start_date             date NOT NULL,
  end_date               date,
  next_run_date          date NOT NULL,
  is_paused              boolean NOT NULL DEFAULT false,
  skip_next              boolean NOT NULL DEFAULT false,
  last_generated_at      timestamptz,
  created_at             timestamptz DEFAULT now(),
  CONSTRAINT recurring_transfer_requires_destination CHECK (
    type != 'transfer' OR transfer_to_account_id IS NOT NULL
  ),
  CONSTRAINT recurring_transfer_different_accounts CHECK (
    type != 'transfer' OR transfer_to_account_id != account_id
  ),
  CONSTRAINT recurring_non_transfer_has_no_destination CHECK (
    type = 'transfer' OR transfer_to_account_id IS NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_next ON recurring_transactions (user_id, next_run_date);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurring_id uuid REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- RLS for recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_recurring" ON recurring_transactions;
DROP POLICY IF EXISTS "users_insert_own_recurring" ON recurring_transactions;
DROP POLICY IF EXISTS "users_update_own_recurring" ON recurring_transactions;
DROP POLICY IF EXISTS "users_delete_own_recurring" ON recurring_transactions;

CREATE POLICY "users_select_own_recurring" ON recurring_transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_recurring" ON recurring_transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_recurring" ON recurring_transactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_recurring" ON recurring_transactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_transactions TO authenticated;

-- Ensure daily frequency is allowed (idempotent; fixes DBs created before session 49)
ALTER TABLE recurring_transactions
  DROP CONSTRAINT IF EXISTS recurring_transactions_frequency_check;

ALTER TABLE recurring_transactions
  ADD CONSTRAINT recurring_transactions_frequency_check
  CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'));

-- Postgres cannot change OUT/return row type with CREATE OR REPLACE — drop first
DROP FUNCTION IF EXISTS get_account_balances();

-- Include bank in balance RPC
CREATE FUNCTION get_account_balances()
RETURNS TABLE (
  id              uuid,
  name            text,
  account_type    text,
  currency        text,
  opening_balance numeric,
  color           text,
  bank            text,
  is_archived     boolean,
  created_at      timestamptz,
  balance         numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.name,
    a.account_type,
    a.currency,
    a.opening_balance,
    a.color,
    a.bank,
    a.is_archived,
    a.created_at,
    a.opening_balance
      + COALESCE((
          SELECT SUM(
            CASE
              WHEN t.type = 'income' THEN t.amount
              WHEN t.type IN ('expense', 'transfer') THEN -t.amount
              ELSE 0
            END
          )
          FROM transactions t
          WHERE t.account_id = a.id AND t.user_id = auth.uid()
        ), 0)
      + COALESCE((
          SELECT SUM(t.amount)
          FROM transactions t
          WHERE t.transfer_to_account_id = a.id
            AND t.type = 'transfer'
            AND t.user_id = auth.uid()
        ), 0) AS balance
  FROM accounts a
  WHERE a.user_id = auth.uid()
  ORDER BY a.is_archived ASC, a.name ASC;
$$;

REVOKE ALL ON FUNCTION get_account_balances() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_account_balances() TO authenticated;
