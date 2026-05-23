import type {
  PlanHealthStatus,
  TransactionType,
} from "@/lib/calculations/types";

export type SavingsPlanRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  target_amount_paise: number;
  target_date: string | null;
  priority: string;
  status: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type SavingsTransactionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  amount_paise: number;
  transaction_type: string;
  source: string | null;
  note: string | null;
  transaction_date: string;
  created_at: string;
};

export type PlanWithStats = {
  id: string;
  name: string;
  category: string;
  priority: string;
  status: string;
  targetAmountPaise: number;
  targetDate: string | null;
  color: string | null;
  currentAmountPaise: number;
  remainingAmountPaise: number;
  progressPercent: number;
  monthlyRequiredPaise: number;
  averageMonthlySavingsPaise: number;
  healthStatus: PlanHealthStatus;
};

export type PlanTransaction = {
  id: string;
  amountPaise: number;
  transactionType: TransactionType;
  source: string | null;
  note: string | null;
  transactionDate: string;
};

export type PlanDetail = PlanWithStats & {
  description: string | null;
  priority: string;
  icon: string | null;
  projectedCompletionDate: Date | null;
  transactions: PlanTransaction[];
};

export type PlansTab = "active" | "completed" | "paused";
