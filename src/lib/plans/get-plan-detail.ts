import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { enrichPlanDetail } from "./enrich-plan";
import type { PlanDetail, SavingsPlanRow, SavingsTransactionRow } from "./types";

export async function getPlanDetail(planId: string): Promise<PlanDetail> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: planRow, error: planError } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (planError || !planRow) {
    notFound();
  }

  const plan = planRow as SavingsPlanRow;

  if (plan.user_id !== user.id) {
    notFound();
  }

  const { data: transactionRows } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("plan_id", planId)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  return enrichPlanDetail(plan, (transactionRows ?? []) as SavingsTransactionRow[]);
}
