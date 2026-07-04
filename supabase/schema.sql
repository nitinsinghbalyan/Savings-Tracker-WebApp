-- ============================================================
-- Savings Tracker — full schema (fresh install with auth)
-- ============================================================

CREATE TABLE goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id     text,
  name          text NOT NULL,
  target_amount numeric NOT NULL,
  start_date    date DEFAULT now(),
  end_date      date,
  priority      text CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  category      text,
  currency      text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  color         text NOT NULL DEFAULT 'indigo' CHECK (color IN ('indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan')),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE contributions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id  text,
  amount     numeric NOT NULL,
  note       text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON goals (user_id);
CREATE INDEX idx_contributions_user_id ON contributions (user_id);
CREATE INDEX idx_goals_device_id ON goals (device_id);
CREATE INDEX idx_contributions_device_id ON contributions (device_id);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

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
