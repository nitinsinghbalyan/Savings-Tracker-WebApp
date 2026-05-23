import { createClient } from "@/lib/supabase/server";

import { enrichPlanWithStats, mapTransactionRow } from "./enrich-plan";
import type {
  PlanWithStats,
  SavingsPlanRow,
  SavingsTransactionRow,
} from "./types";
import type { SavingsTransaction } from "@/lib/calculations/types";

export async function getPlansWithStats(): Promise<{ plans: PlanWithStats[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { plans: [] };
  }

  const { data: planRows, error: plansError } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (plansError || !planRows?.length) {
    return { plans: [] };
  }

  const { data: transactionRows } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("user_id", user.id);

  const transactionsByPlanId = new Map<string, SavingsTransaction[]>();

  for (const row of (transactionRows ?? []) as SavingsTransactionRow[]) {
    const mapped = mapTransactionRow(row);
    const existing = transactionsByPlanId.get(row.plan_id) ?? [];
    existing.push(mapped);
    transactionsByPlanId.set(row.plan_id, existing);
  }

  const plans = (planRows as SavingsPlanRow[]).map((plan) =>
    enrichPlanWithStats(plan, transactionsByPlanId.get(plan.id) ?? []),
  );

  return { plans };
}
