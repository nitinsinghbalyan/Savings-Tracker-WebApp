-- ============================================================
-- Savings Tracker — Net worth (holdings, snapshots, contribution plans)
-- Run in Supabase SQL Editor AFTER phase2_finance.sql
--
-- Schema only. This migration inserts no rows: every holding is
-- entered by the user in the app.
-- ============================================================

-- Assets and liabilities the ledger cannot see.
-- Liquid balances and credit-card debt are NOT stored here — they are read
-- live from `accounts` via get_account_balances(). A holding may point at an
-- account with linked_account_id, in which case the app counts the account
-- row and skips the holding, so nothing is double counted.
CREATE TABLE holdings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  holding_group text NOT NULL
    CHECK (holding_group IN (
      'large_fixed', 'liquid', 'personal',
      'long_term_liability', 'short_term_liability'
    )),
  currency      text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  value         numeric NOT NULL DEFAULT 0,   -- used when quantity IS NULL
  quantity      numeric,                       -- units / grams / shares
  unit_price    numeric,                       -- repriced by hand
  unit_label    text,
  excluded_from_target boolean NOT NULL DEFAULT false,
  linked_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  note          text,
  sort_order    int NOT NULL DEFAULT 0,
  is_archived   boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_holdings_user_id ON holdings (user_id);
CREATE INDEX idx_holdings_user_group ON holdings (user_id, holding_group);

-- Net worth history. One row per period per currency, upserted by the client.
-- The trend chart reads at most 24 of these, so history never costs a ledger scan.
CREATE TABLE net_worth_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period          date NOT NULL,
  currency        text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  assets          numeric NOT NULL DEFAULT 0,
  liabilities     numeric NOT NULL DEFAULT 0,
  net_worth       numeric NOT NULL DEFAULT 0,
  target_eligible numeric NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, period, currency)
);

CREATE INDEX idx_net_worth_snapshots_user_period
  ON net_worth_snapshots (user_id, period DESC);

-- Planned recurring investments. Deliberately separate from
-- categories.monthly_budget: budgets are spending ceilings consumed by the
-- Summary heatmap, these are savings floors.
CREATE TABLE contribution_plans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  monthly_amount numeric NOT NULL DEFAULT 0,
  currency       text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  category_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  holding_id     uuid REFERENCES holdings(id) ON DELETE SET NULL,
  sort_order     int NOT NULL DEFAULT 0,
  is_archived    boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_contribution_plans_user_id ON contribution_plans (user_id);

-- The net worth target. There is exactly one per user, so it lives on the
-- profile rather than in a table of its own.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS net_worth_target numeric,
  ADD COLUMN IF NOT EXISTS net_worth_target_date date;

-- ============================================================
-- Row level security (same shape as phase2_finance.sql)
-- ============================================================

-- RLS is the ONLY thing keeping this data private: Supabase grants every new
-- table in `public` to the `anon` role through default privileges, so the
-- GRANTs at the bottom of this file restrict nothing on their own. Shipping
-- these tables with RLS off exposed 48 holdings and a net worth snapshot to
-- anyone holding the anon key (which is in the client bundle) — see
-- error-history.md 2026-09-10. Never let this block fail silently.
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE holdings FORCE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE contribution_plans FORCE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_holdings" ON holdings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_holdings" ON holdings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_holdings" ON holdings
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_holdings" ON holdings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_select_own_net_worth_snapshots" ON net_worth_snapshots
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_net_worth_snapshots" ON net_worth_snapshots
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_net_worth_snapshots" ON net_worth_snapshots
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_net_worth_snapshots" ON net_worth_snapshots
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_select_own_contribution_plans" ON contribution_plans
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_contribution_plans" ON contribution_plans
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_contribution_plans" ON contribution_plans
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_contribution_plans" ON contribution_plans
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Take away what Supabase's default privileges handed to `anon`.
REVOKE ALL ON holdings FROM anon;
REVOKE ALL ON net_worth_snapshots FROM anon;
REVOKE ALL ON contribution_plans FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON holdings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON net_worth_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contribution_plans TO authenticated;

-- Verify before trusting this migration. Every row must read
-- rls_enabled = true and policy_count = 4.
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       COUNT(p.polname) AS policy_count
FROM pg_class c
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relname IN ('holdings', 'net_worth_snapshots', 'contribution_plans')
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;
