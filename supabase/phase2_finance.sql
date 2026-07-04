-- ============================================================
-- Savings Tracker — Phase 2 finance (accounts, categories, transactions)
-- Run in Supabase SQL Editor AFTER add_auth.sql
-- ============================================================

-- User preferences
CREATE TABLE user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency text NOT NULL DEFAULT 'INR' CHECK (default_currency IN ('INR', 'USD')),
  month_start_day  smallint NOT NULL DEFAULT 1 CHECK (month_start_day BETWEEN 1 AND 28),
  created_at       timestamptz DEFAULT now()
);

-- Bank accounts
CREATE TABLE accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  account_type    text NOT NULL DEFAULT 'checking'
    CHECK (account_type IN ('checking', 'savings', 'cash', 'credit')),
  currency        text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  opening_balance numeric NOT NULL DEFAULT 0,
  color           text NOT NULL DEFAULT 'indigo'
    CHECK (color IN ('indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan')),
  is_archived     boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

-- Spending categories (expense + income)
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('expense', 'income')),
  icon        text,
  color       text DEFAULT 'indigo'
    CHECK (color IS NULL OR color IN ('indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan')),
  sort_order  int NOT NULL DEFAULT 0,
  is_system   boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_categories_user_id ON categories (user_id);
CREATE INDEX idx_categories_user_kind ON categories (user_id, kind);

-- Unified ledger
CREATE TABLE transactions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id             uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  category_id            uuid REFERENCES categories(id) ON DELETE SET NULL,
  type                   text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount                 numeric NOT NULL CHECK (amount > 0),
  transfer_to_account_id uuid REFERENCES accounts(id) ON DELETE RESTRICT,
  note                   text,
  transaction_date       date NOT NULL DEFAULT CURRENT_DATE,
  created_at             timestamptz DEFAULT now(),
  CONSTRAINT transfer_requires_destination CHECK (
    type != 'transfer' OR transfer_to_account_id IS NOT NULL
  ),
  CONSTRAINT transfer_different_accounts CHECK (
    type != 'transfer' OR transfer_to_account_id != account_id
  ),
  CONSTRAINT non_transfer_has_no_destination CHECK (
    type = 'transfer' OR transfer_to_account_id IS NULL
  )
);

CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account_id ON transactions (account_id);
CREATE INDEX idx_transactions_category_id ON transactions (category_id);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_profile" ON user_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_select_own_accounts" ON accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_accounts" ON accounts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_accounts" ON accounts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_accounts" ON accounts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_select_own_categories" ON categories
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_categories" ON categories
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_categories" ON categories
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_select_own_transactions" ON transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_transactions" ON transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_transactions" ON transactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_transactions" ON transactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- Account balances with computed ledger
CREATE OR REPLACE FUNCTION get_account_balances()
RETURNS TABLE (
  id              uuid,
  name            text,
  account_type    text,
  currency        text,
  opening_balance numeric,
  color           text,
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

-- Atomic transfer between same-currency accounts
CREATE OR REPLACE FUNCTION create_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_transaction_date date,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_from_currency text;
  v_to_currency text;
  v_tx_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  IF p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'Cannot transfer to the same account';
  END IF;

  SELECT currency INTO v_from_currency
  FROM accounts
  WHERE id = p_from_account_id AND user_id = v_user_id;

  IF v_from_currency IS NULL THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  SELECT currency INTO v_to_currency
  FROM accounts
  WHERE id = p_to_account_id AND user_id = v_user_id;

  IF v_to_currency IS NULL THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  IF v_from_currency != v_to_currency THEN
    RAISE EXCEPTION 'Accounts must use the same currency';
  END IF;

  INSERT INTO transactions (
    user_id, account_id, type, amount, transfer_to_account_id, note, transaction_date
  ) VALUES (
    v_user_id, p_from_account_id, 'transfer', p_amount, p_to_account_id, p_note, p_transaction_date
  )
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;

REVOKE ALL ON FUNCTION create_transfer(uuid, uuid, numeric, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_transfer(uuid, uuid, numeric, date, text) TO authenticated;
