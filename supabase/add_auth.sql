-- ============================================================
-- Savings Tracker — add Supabase Auth (user-scoped data)
-- Run in Supabase SQL Editor AFTER base schema exists.
--
-- Also enable providers in:
-- Dashboard → Authentication → Providers → Email
-- Dashboard → Authentication → Providers → Google
-- Add redirect URLs: http://localhost:5173 and your Vercel production URL
-- ============================================================

-- Link rows to authenticated users
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- device_id kept for one-time claim of pre-auth data; no longer required
ALTER TABLE goals ALTER COLUMN device_id DROP NOT NULL;
ALTER TABLE contributions ALTER COLUMN device_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions (user_id);

-- Drop permissive anon policies
DROP POLICY IF EXISTS "anon_select_goals" ON goals;
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
DROP POLICY IF EXISTS "anon_select_contributions" ON contributions;
DROP POLICY IF EXISTS "anon_insert_contributions" ON contributions;
DROP POLICY IF EXISTS "anon_update_contributions" ON contributions;
DROP POLICY IF EXISTS "anon_delete_contributions" ON contributions;

-- Authenticated users only see their own rows
CREATE POLICY "users_select_own_goals" ON goals
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_goals" ON goals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_goals" ON goals
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_goals" ON goals
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_select_own_contributions" ON contributions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_contributions" ON contributions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_contributions" ON contributions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_contributions" ON contributions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contributions TO authenticated;

-- Claim anonymous (device_id) data after first login on that browser
CREATE OR REPLACE FUNCTION claim_device_data(p_device_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_device_id IS NULL OR length(trim(p_device_id)) = 0 THEN
    RETURN 0;
  END IF;

  UPDATE goals
  SET user_id = auth.uid()
  WHERE device_id = p_device_id AND user_id IS NULL;

  GET DIAGNOSTICS claimed = ROW_COUNT;

  UPDATE contributions
  SET user_id = auth.uid()
  WHERE device_id = p_device_id AND user_id IS NULL;

  RETURN claimed;
END;
$$;

REVOKE ALL ON FUNCTION claim_device_data(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_device_data(text) TO authenticated;
