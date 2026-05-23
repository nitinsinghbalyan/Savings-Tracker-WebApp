import { formatINR } from "@/lib/format-inr";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type { PlanWithStats } from "@/lib/plans/types";

import { HEALTH_SCORE_WEIGHTS } from "./health-score";
import type { HealthScoreBreakdown, InsightsNarrative } from "./types";

const EMERGENCY_FUND_CATEGORY = "Emergency Fund";

function isStrong(score: number, max: number): boolean {
  return score >= max * 0.8;
}

function isWeak(score: number, max: number): boolean {
  return score <= max * 0.4;
}

export function buildInsightsNarrative(
  plans: PlanWithStats[],
  breakdown: HealthScoreBreakdown,
  positiveSavingsMonths: number,
  currentStreak: number,
): InsightsNarrative {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const actions: string[] = [];

  const activePlans = filterPlansByTab(plans, "active");
  const emergencyPlan = plans.find(
    (plan) => plan.category === EMERGENCY_FUND_CATEGORY,
  );

  if (isStrong(breakdown.pace, HEALTH_SCORE_WEIGHTS.pace)) {
    strengths.push("Your average monthly savings are keeping pace with your goals.");
  } else if (isWeak(breakdown.pace, HEALTH_SCORE_WEIGHTS.pace)) {
    weaknesses.push("Your savings pace is below what your active goals require.");
    const gap = activePlans.reduce(
      (sum, plan) =>
        plan.targetDate
          ? sum + Math.max(0, plan.monthlyRequiredPaise - plan.averageMonthlySavingsPaise)
          : sum,
      0,
    );

    if (gap > 0) {
      actions.push(
        `Increase monthly savings by about ${formatINR(gap)} to stay on track.`,
      );
    } else {
      actions.push("Log contributions this month to improve your savings pace.");
    }
  }

  if (emergencyPlan) {
    if (isStrong(breakdown.emergencyFund, HEALTH_SCORE_WEIGHTS.emergencyFund)) {
      strengths.push(
        `Your ${emergencyPlan.name} is ${emergencyPlan.progressPercent}% funded.`,
      );
    } else if (isWeak(breakdown.emergencyFund, HEALTH_SCORE_WEIGHTS.emergencyFund)) {
      weaknesses.push("Your emergency fund still needs more progress.");
      actions.push(
        `Add ${formatINR(emergencyPlan.remainingAmountPaise)} toward ${emergencyPlan.name} when you can.`,
      );
    }
  } else {
    weaknesses.push("You do not have an Emergency Fund plan yet.");
    actions.push("Create an Emergency Fund plan to strengthen your safety net.");
  }

  if (isStrong(breakdown.consistency, HEALTH_SCORE_WEIGHTS.consistency)) {
    strengths.push(
      currentStreak > 1
        ? `You have a ${currentStreak}-month positive savings streak.`
        : `You saved in ${positiveSavingsMonths} of the last 6 months.`,
    );
  } else if (isWeak(breakdown.consistency, HEALTH_SCORE_WEIGHTS.consistency)) {
    weaknesses.push("Saving has been inconsistent over recent months.");
    actions.push("Log a contribution this month to build your savings streak.");
  }

  const onTrackPlan = activePlans.find((plan) => plan.healthStatus === "ON_TRACK");

  if (onTrackPlan && isStrong(breakdown.onTrackPlans, HEALTH_SCORE_WEIGHTS.onTrackPlans)) {
    strengths.push(`Your ${onTrackPlan.name} is on track.`);
  } else if (isWeak(breakdown.onTrackPlans, HEALTH_SCORE_WEIGHTS.onTrackPlans)) {
    weaknesses.push("Fewer than half of your active plans are on track.");
    actions.push("Review at-risk plans and add contributions where needed.");
  }

  if (isStrong(breakdown.lowWithdrawals, HEALTH_SCORE_WEIGHTS.lowWithdrawals)) {
    strengths.push("Withdrawals have been low relative to contributions recently.");
  } else if (isWeak(breakdown.lowWithdrawals, HEALTH_SCORE_WEIGHTS.lowWithdrawals)) {
    weaknesses.push("Recent withdrawals are reducing your savings momentum.");
    actions.push("Minimize withdrawals unless necessary for your goals.");
  }

  if (strengths.length === 0) {
    strengths.push("You are building a savings habit across your goals.");
  }

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    actions: actions.slice(0, 4),
  };
}
