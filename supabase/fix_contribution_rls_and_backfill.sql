-- Backfill contribution user_id from parent goal
UPDATE contributions c
SET user_id = g.user_id
FROM goals g
WHERE c.goal_id = g.id
  AND c.user_id IS NULL
  AND g.user_id IS NOT NULL;

-- Allow reading contributions via goal ownership
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
