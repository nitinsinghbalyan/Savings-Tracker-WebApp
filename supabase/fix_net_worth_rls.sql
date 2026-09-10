-- ============================================================
-- URGENT: close public read access on the net worth tables
--
-- add_net_worth.sql created the three tables but its row-level-security
-- block did not take effect on production. Supabase grants every new table
-- in `public` to the `anon` role through default privileges, so RLS is the
-- only thing preventing anonymous reads — and with it off, all 48 holdings
-- and the net worth snapshot were readable by anyone holding the anon key,
-- which ships inside the client bundle.
--
-- Safe to run more than once: every statement is idempotent.
-- Run the WHOLE file in one go in the Supabase SQL editor.
-- ============================================================

-- 1. Turn RLS on. This is the statement that actually closes the hole.
ALTER TABLE holdings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_plans   ENABLE ROW LEVEL SECURITY;

-- Also force it for the table owner, so nothing bypasses it implicitly.
ALTER TABLE holdings             FORCE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots  FORCE ROW LEVEL SECURITY;
ALTER TABLE contribution_plans   FORCE ROW LEVEL SECURITY;

-- 2. Recreate the per-user policies (drop first so a partial earlier run
--    cannot make this fail).
DROP POLICY IF EXISTS "users_select_own_holdings" ON holdings;
DROP POLICY IF EXISTS "users_insert_own_holdings" ON holdings;
DROP POLICY IF EXISTS "users_update_own_holdings" ON holdings;
DROP POLICY IF EXISTS "users_delete_own_holdings" ON holdings;

CREATE POLICY "users_select_own_holdings" ON holdings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_holdings" ON holdings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_holdings" ON holdings
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_holdings" ON holdings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_select_own_net_worth_snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "users_insert_own_net_worth_snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "users_update_own_net_worth_snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "users_delete_own_net_worth_snapshots" ON net_worth_snapshots;

CREATE POLICY "users_select_own_net_worth_snapshots" ON net_worth_snapshots
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_net_worth_snapshots" ON net_worth_snapshots
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_net_worth_snapshots" ON net_worth_snapshots
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_net_worth_snapshots" ON net_worth_snapshots
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_select_own_contribution_plans" ON contribution_plans;
DROP POLICY IF EXISTS "users_insert_own_contribution_plans" ON contribution_plans;
DROP POLICY IF EXISTS "users_update_own_contribution_plans" ON contribution_plans;
DROP POLICY IF EXISTS "users_delete_own_contribution_plans" ON contribution_plans;

CREATE POLICY "users_select_own_contribution_plans" ON contribution_plans
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_contribution_plans" ON contribution_plans
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_contribution_plans" ON contribution_plans
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_contribution_plans" ON contribution_plans
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3. Defence in depth: take the table privileges away from `anon` entirely,
--    so the data is unreachable even if RLS were ever switched off again.
REVOKE ALL ON holdings            FROM anon;
REVOKE ALL ON net_worth_snapshots FROM anon;
REVOKE ALL ON contribution_plans  FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON holdings            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON net_worth_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contribution_plans  TO authenticated;

-- 4. Confirm. Every row must read rls_enabled = true and policy_count = 4.
SELECT c.relname            AS table_name,
       c.relrowsecurity     AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       COUNT(p.polname)     AS policy_count
FROM pg_class c
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relname IN ('holdings', 'net_worth_snapshots', 'contribution_plans')
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relname;
