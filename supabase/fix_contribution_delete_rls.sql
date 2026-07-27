-- Allow deleting contributions when the user owns the parent goal
-- (mirrors the SELECT fix in fix_contribution_rls_and_backfill.sql).
-- Needed so goal delete CASCADE works when contribution.user_id is null/mismatched.

-- Backfill contribution user_id from parent goal
UPDATE contributions c
SET user_id = g.user_id
FROM goals g
WHERE c.goal_id = g.id
  AND c.user_id IS NULL
  AND g.user_id IS NOT NULL;

DROP POLICY IF EXISTS "users_delete_own_contributions" ON contributions;

CREATE POLICY "users_delete_own_contributions" ON contributions
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = contributions.goal_id
        AND goals.user_id = auth.uid()
    )
  );
