import { formatINR } from "@/lib/format-inr";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type { PlanWithStats } from "@/lib/plans/types";

import type { DashboardSummary } from "./types";

export function generateDashboardInsights(
  plans: PlanWithStats[],
  summary: DashboardSummary,
): string[] {
  if (plans.length === 0) {
    return [];
  }

  const insights: string[] = [];
  const activePlans = filterPlansByTab(plans, "active");

  const monthlyGap = Math.max(
    0,
    summary.requiredThisMonthPaise - summary.savedThisMonthPaise,
  );

  if (summary.requiredThisMonthPaise > 0 && monthlyGap > 0) {
    insights.push(
      `You need ${formatINR(monthlyGap)} more this month to stay on track.`,
    );
  }

  insights.push(
    `You completed ${summary.overallProgressPercent}% of your total savings target.`,
  );

  const onTrackPlan = activePlans.find(
    (plan) => plan.healthStatus === "ON_TRACK",
  );

  if (onTrackPlan) {
    insights.push(`Your ${onTrackPlan.name} is on track.`);
  }

  const behindPlan = activePlans.find(
    (plan) =>
      plan.targetDate &&
      (plan.healthStatus === "SLIGHTLY_BEHIND" ||
        plan.healthStatus === "CRITICAL"),
  );

  if (behindPlan) {
    const monthlyGapForPlan = Math.max(
      0,
      behindPlan.monthlyRequiredPaise - behindPlan.averageMonthlySavingsPaise,
    );

    if (monthlyGapForPlan > 0) {
      insights.push(
        `${behindPlan.name} is behind by ${formatINR(monthlyGapForPlan)}/month.`,
      );
    }
  }

  return insights.slice(0, 4);
}
