-- One-time Net balance adjustment (INR), synced across web + PWA via account
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS net_balance_adjustment_inr numeric NOT NULL DEFAULT 0
    CHECK (net_balance_adjustment_inr >= 0);
