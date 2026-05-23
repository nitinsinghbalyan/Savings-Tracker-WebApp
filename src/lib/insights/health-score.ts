import { startOfMonth, subMonths } from "date-fns";

import type { SavingsTransaction } from "@/lib/calculations/types";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type { PlanWithStats } from "@/lib/plans/types";
import { toDate } from "@/lib/calculations/types";

import { countPositiveSavingsMonths } from "./streak";
import type { HealthScoreBreakdown } from "./types";

const PACE_MAX = 30;
const EMERGENCY_FUND_MAX = 25;
const CONSISTENCY_MAX = 20;
const ON_TRACK_MAX = 15;
const LOW_WITHDRAWALS_MAX = 10;

const EMERGENCY_FUND_CATEGORY = "Emergency Fund";

function scorePace(activePlans: PlanWithStats[]): number {
  const plansWithTarget = activePlans.filter((plan) => plan.targetDate);

  if (plansWithTarget.length === 0) {
    return PACE_MAX;
  }

  const totalRequired = plansWithTarget.reduce(
    (sum, plan) => sum + plan.monthlyRequiredPaise,
    0,
  );
  const totalAverage = plansWithTarget.reduce(
    (sum, plan) => sum + plan.averageMonthlySavingsPaise,
    0,
  );

  if (totalRequired <= 0) {
    return PACE_MAX;
  }

  const ratio = Math.min(1, totalAverage / totalRequired);
  return Math.round(ratio * PACE_MAX);
}

function scoreEmergencyFund(plans: PlanWithStats[]): number {
  const emergencyPlan = plans.find(
    (plan) => plan.category === EMERGENCY_FUND_CATEGORY,
  );

  if (!emergencyPlan) {
    return 0;
  }

  return Math.round((emergencyPlan.progressPercent / 100) * EMERGENCY_FUND_MAX);
}

function scoreConsistency(
  transactions: SavingsTransaction[],
  referenceDate: Date,
): number {
  const positiveMonths = countPositiveSavingsMonths(
    transactions,
    6,
    referenceDate,
  );

  return Math.round((positiveMonths / 6) * CONSISTENCY_MAX);
}

function scoreOnTrackPlans(activePlans: PlanWithStats[]): number {
  if (activePlans.length === 0) {
    return 0;
  }

  const onTrackCount = activePlans.filter(
    (plan) => plan.healthStatus === "ON_TRACK",
  ).length;

  return Math.round((onTrackCount / activePlans.length) * ON_TRACK_MAX);
}

function scoreLowWithdrawals(
  transactions: SavingsTransaction[],
  referenceDate: Date,
): number {
  const windowStart = startOfMonth(subMonths(referenceDate, 5));

  let contributionPaise = 0;
  let withdrawalPaise = 0;

  for (const transaction of transactions) {
    const date = toDate(transaction.transactionDate);

    if (date < windowStart) {
      continue;
    }

    if (transaction.transactionType === "CONTRIBUTION") {
      contributionPaise += transaction.amountPaise;
    } else if (transaction.transactionType === "WITHDRAWAL") {
      withdrawalPaise += transaction.amountPaise;
    }
  }

  const total = contributionPaise + withdrawalPaise;

  if (total <= 0) {
    return LOW_WITHDRAWALS_MAX;
  }

  const withdrawalRatio = Math.min(1, withdrawalPaise / total);
  return Math.round((1 - withdrawalRatio) * LOW_WITHDRAWALS_MAX);
}

export function calculateSavingsHealthScore(
  plans: PlanWithStats[],
  allTransactions: SavingsTransaction[],
  referenceDate: Date = new Date(),
): HealthScoreBreakdown {
  const activePlans = filterPlansByTab(plans, "active");

  const pace = scorePace(activePlans);
  const emergencyFund = scoreEmergencyFund(plans);
  const consistency = scoreConsistency(allTransactions, referenceDate);
  const onTrackPlans = scoreOnTrackPlans(activePlans);
  const lowWithdrawals = scoreLowWithdrawals(allTransactions, referenceDate);

  const total =
    pace + emergencyFund + consistency + onTrackPlans + lowWithdrawals;

  return {
    total,
    pace,
    emergencyFund,
    consistency,
    onTrackPlans,
    lowWithdrawals,
  };
}

export const HEALTH_SCORE_WEIGHTS = {
  pace: PACE_MAX,
  emergencyFund: EMERGENCY_FUND_MAX,
  consistency: CONSISTENCY_MAX,
  onTrackPlans: ON_TRACK_MAX,
  lowWithdrawals: LOW_WITHDRAWALS_MAX,
} as const;
