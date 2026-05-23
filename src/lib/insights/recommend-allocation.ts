import { format } from "date-fns";

import type { PlanWithStats } from "@/lib/plans/types";

import type { AllocationRecommendation } from "./types";

const PRIORITY_RANK: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const EMERGENCY_FUND_CATEGORY = "Emergency Fund";

function priorityRank(priority: string): number {
  return PRIORITY_RANK[priority] ?? 99;
}

function comparePlansForAllocation(a: PlanWithStats, b: PlanWithStats): number {
  const priorityDiff = priorityRank(a.priority) - priorityRank(b.priority);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const emergencyDiff =
    (a.category === EMERGENCY_FUND_CATEGORY ? 0 : 1) -
    (b.category === EMERGENCY_FUND_CATEGORY ? 0 : 1);

  if (emergencyDiff !== 0) {
    return emergencyDiff;
  }

  if (a.targetDate && b.targetDate) {
    return (
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
  }

  if (a.targetDate) {
    return -1;
  }

  if (b.targetDate) {
    return 1;
  }

  return a.progressPercent - b.progressPercent;
}

function buildAllocationReasons(plan: PlanWithStats): string[] {
  const reasons: string[] = [];

  if (plan.priority === "Critical") {
    reasons.push("Critical priority");
  } else if (plan.priority === "High") {
    reasons.push("High priority");
  }

  if (plan.category === EMERGENCY_FUND_CATEGORY) {
    reasons.push("Emergency Fund");
  }

  if (plan.targetDate) {
    reasons.push(
      `Target date: ${format(new Date(plan.targetDate), "d MMM yyyy")}`,
    );
  }

  if (plan.progressPercent < 50) {
    reasons.push("Lower progress needs attention");
  }

  if (reasons.length === 0) {
    reasons.push("Active savings goal");
  }

  return reasons;
}

function monthlyNeedForPlan(plan: PlanWithStats): number {
  if (plan.monthlyRequiredPaise > 0) {
    return plan.monthlyRequiredPaise;
  }

  return plan.remainingAmountPaise;
}

export function recommendAllocation(
  availablePaise: number,
  activePlans: PlanWithStats[],
): AllocationRecommendation[] {
  if (availablePaise <= 0 || activePlans.length === 0) {
    return [];
  }

  const sortedPlans = [...activePlans].sort(comparePlansForAllocation);
  const recommendations: AllocationRecommendation[] = [];
  let remaining = availablePaise;

  for (const plan of sortedPlans) {
    if (remaining <= 0) {
      break;
    }

    const need = monthlyNeedForPlan(plan);

    if (need <= 0) {
      continue;
    }

    const amountPaise = Math.min(remaining, need);

    recommendations.push({
      planId: plan.id,
      planName: plan.name,
      amountPaise,
      reasons: buildAllocationReasons(plan),
    });

    remaining -= amountPaise;
  }

  return recommendations;
}
