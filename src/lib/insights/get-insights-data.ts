import { projectCompletionDate } from "@/lib/calculations/projections";
import { buildMonthlySavingsSeries } from "@/lib/dashboard/period-savings";
import { enrichPlanWithStats, mapTransactionRow } from "@/lib/plans/enrich-plan";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type {
  SavingsPlanRow,
  SavingsTransactionRow,
} from "@/lib/plans/types";
import type { SavingsTransaction } from "@/lib/calculations/types";
import { createClient } from "@/lib/supabase/server";

import { buildInsightsNarrative } from "./generate-narrative";
import { calculateSavingsHealthScore } from "./health-score";
import {
  calculateCurrentSavingsStreak,
  countPositiveSavingsMonths,
} from "./streak";
import type { InsightsData, InsightsPlan } from "./types";

const AT_RISK_STATUSES = new Set(["CRITICAL", "SLIGHTLY_BEHIND"]);

function toInsightsPlan(
  plan: ReturnType<typeof enrichPlanWithStats>,
): InsightsPlan {
  const projectedCompletionDate =
    plan.currentAmountPaise >= plan.targetAmountPaise
      ? null
      : projectCompletionDate({
          currentAmountPaise: plan.currentAmountPaise,
          targetAmountPaise: plan.targetAmountPaise,
          monthlyContributionPaise: plan.averageMonthlySavingsPaise,
        });

  return {
    ...plan,
    projectedCompletionDate,
  };
}

function emptyInsightsData(): InsightsData {
  return {
    hasPlans: false,
    healthScore: {
      total: 0,
      pace: 0,
      emergencyFund: 0,
      consistency: 0,
      onTrackPlans: 0,
      lowWithdrawals: 0,
    },
    narrative: {
      strengths: [],
      weaknesses: ["Create a savings plan to unlock personalized insights."],
      actions: ["Start with an Emergency Fund or your top priority goal."],
    },
    atRiskPlans: [],
    completedPlans: [],
    activePlans: [],
    chartData: buildMonthlySavingsSeries([]),
    positiveSavingsMonths: 0,
    currentStreak: 0,
  };
}

export async function getInsightsData(): Promise<InsightsData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyInsightsData();
  }

  const { data: planRows } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: transactionRows } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("user_id", user.id);

  const allTransactions: SavingsTransaction[] = (
    (transactionRows ?? []) as SavingsTransactionRow[]
  ).map(mapTransactionRow);

  if (!planRows?.length) {
    return {
      ...emptyInsightsData(),
      chartData: buildMonthlySavingsSeries(allTransactions),
    };
  }

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

  const insightsPlans = plans.map(toInsightsPlan);
  const activePlans = filterPlansByTab(insightsPlans, "active");
  const completedPlans = filterPlansByTab(insightsPlans, "completed");
  const atRiskPlans = activePlans.filter((plan) =>
    AT_RISK_STATUSES.has(plan.healthStatus),
  );

  const positiveSavingsMonths = countPositiveSavingsMonths(allTransactions);
  const currentStreak = calculateCurrentSavingsStreak(allTransactions);
  const healthScore = calculateSavingsHealthScore(plans, allTransactions);
  const narrative = buildInsightsNarrative(
    plans,
    healthScore,
    positiveSavingsMonths,
    currentStreak,
  );

  return {
    hasPlans: true,
    healthScore,
    narrative,
    atRiskPlans,
    completedPlans,
    activePlans,
    chartData: buildMonthlySavingsSeries(allTransactions),
    positiveSavingsMonths,
    currentStreak,
  };
}
