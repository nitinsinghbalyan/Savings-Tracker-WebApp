-- Allow daily recurring transactions (run after add_subcategories_recurring_bank.sql)
-- Idempotent: drops any existing frequency CHECK, then re-adds with daily included.

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'recurring_transactions'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%frequency%'
  LOOP
    EXECUTE format(
      'ALTER TABLE recurring_transactions DROP CONSTRAINT IF EXISTS %I',
      constraint_name
    );
  END LOOP;
END $$;

ALTER TABLE recurring_transactions
  ADD CONSTRAINT recurring_transactions_frequency_check
  CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'));
