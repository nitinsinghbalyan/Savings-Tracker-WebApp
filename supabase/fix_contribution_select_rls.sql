-- Fix: show contributions on goals even if contribution.user_id was not backfilled
-- Run in Supabase SQL Editor if goals appear but amounts/progress look empty on another device.

DROP POLICY IF EXISTS "users_select_own_contributions" ON contributions;

CREATE POLICY "users_select_own_contributions" ON contributions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = contributions.goal_id
        AND goals.user_id = auth.uid()
    )
  );
