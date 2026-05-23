import { calculateProgress } from "@/lib/calculations/savings";
import type { SavingsTransaction } from "@/lib/calculations/types";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type { PlanWithStats } from "@/lib/plans/types";

import { calculateNetSavingsInMonth } from "./period-savings";
import type { DashboardSummary } from "./types";

const AT_RISK_STATUSES = new Set(["CRITICAL", "SLIGHTLY_BEHIND"]);

export function aggregateDashboardMetrics(
  plans: PlanWithStats[],
  allTransactions: SavingsTransaction[],
  referenceDate: Date = new Date(),
): DashboardSummary {
  const totalSavedPaise = plans.reduce(
    (sum, plan) => sum + plan.currentAmountPaise,
    0,
  );
  const totalTargetPaise = plans.reduce(
    (sum, plan) => sum + plan.targetAmountPaise,
    0,
  );
  const overallProgressPercent = calculateProgress(
    totalSavedPaise,
    totalTargetPaise,
  );
  const savedThisMonthPaise = calculateNetSavingsInMonth(
    allTransactions,
    referenceDate,
  );

  const activePlans = filterPlansByTab(plans, "active");
  const completedPlans = filterPlansByTab(plans, "completed");

  const requiredThisMonthPaise = activePlans.reduce(
    (sum, plan) =>
      plan.targetDate ? sum + plan.monthlyRequiredPaise : sum,
    0,
  );

  const atRiskPlansCount = activePlans.filter((plan) =>
    AT_RISK_STATUSES.has(plan.healthStatus),
  ).length;

  return {
    totalSavedPaise,
    totalTargetPaise,
    overallProgressPercent,
    savedThisMonthPaise,
    requiredThisMonthPaise,
    activePlansCount: activePlans.length,
    completedPlansCount: completedPlans.length,
    atRiskPlansCount,
  };
}
