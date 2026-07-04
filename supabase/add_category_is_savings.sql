-- Tag expense categories as savings (excluded from spending totals in monthly summary)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_savings boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN categories.is_savings IS
  'When true, expense transactions in this category count as savings, not spending.';
