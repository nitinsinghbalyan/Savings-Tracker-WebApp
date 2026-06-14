-- ============================================================
-- Savings Tracker — full schema (fresh install)
-- Run this only if you have NOT created tables yet.
-- If goals already exists, use add_currency_color.sql instead.
-- ============================================================

CREATE TABLE goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id     text NOT NULL,
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
  device_id  text NOT NULL,
  amount     numeric NOT NULL,
  note       text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_goals_device_id ON goals (device_id);
CREATE INDEX idx_contributions_device_id ON contributions (device_id);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_goals" ON goals FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_contributions" ON contributions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_contributions" ON contributions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_contributions" ON contributions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_contributions" ON contributions FOR DELETE TO anon USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON contributions TO anon;
