-- SavingIt initial schema
-- All monetary amounts stored as bigint paise (1 INR = 100 paise)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  monthly_income_paise bigint,
  preferred_saving_day int DEFAULT 1,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- savings_plans
-- ---------------------------------------------------------------------------

CREATE TABLE public.savings_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'Custom',
  target_amount_paise bigint NOT NULL,
  target_date date,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  icon text,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_savings_plans_user_id ON public.savings_plans(user_id);

CREATE TRIGGER set_savings_plans_updated_at
  BEFORE UPDATE ON public.savings_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- savings_transactions
-- ---------------------------------------------------------------------------

CREATE TABLE public.savings_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  amount_paise bigint NOT NULL,
  transaction_type text NOT NULL
    CHECK (transaction_type IN ('CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT')),
  source text,
  note text,
  transaction_date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_plan_id ON public.savings_transactions(plan_id);
CREATE INDEX idx_savings_transactions_transaction_date ON public.savings_transactions(transaction_date);

-- ---------------------------------------------------------------------------
-- monthly_snapshots (month format: YYYY-MM)
-- ---------------------------------------------------------------------------

CREATE TABLE public.monthly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  total_saved_paise bigint DEFAULT 0,
  total_target_paise bigint DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_monthly_snapshots_user_id ON public.monthly_snapshots(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;

-- profiles (id = auth user id)

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- savings_plans

CREATE POLICY savings_plans_select_own ON public.savings_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY savings_plans_insert_own ON public.savings_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY savings_plans_update_own ON public.savings_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY savings_plans_delete_own ON public.savings_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- savings_transactions

CREATE POLICY savings_transactions_select_own ON public.savings_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY savings_transactions_insert_own ON public.savings_transactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.savings_plans
      WHERE id = plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY savings_transactions_update_own ON public.savings_transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.savings_plans
      WHERE id = plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY savings_transactions_delete_own ON public.savings_transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- monthly_snapshots

CREATE POLICY monthly_snapshots_select_own ON public.monthly_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY monthly_snapshots_insert_own ON public.monthly_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY monthly_snapshots_update_own ON public.monthly_snapshots
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY monthly_snapshots_delete_own ON public.monthly_snapshots
  FOR DELETE
  USING (auth.uid() = user_id);
