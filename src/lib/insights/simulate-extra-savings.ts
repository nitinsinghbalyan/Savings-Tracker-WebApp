import { differenceInCalendarMonths } from "date-fns";

import { projectCompletionDate } from "@/lib/calculations/projections";

import type { InsightsPlan, SimulationResult } from "./types";

export function simulateExtraMonthlySavings(
  plan: InsightsPlan,
  extraMonthlyPaise: number,
  referenceDate: Date = new Date(),
): SimulationResult {
  const baselineDate = plan.projectedCompletionDate;

  if (plan.currentAmountPaise >= plan.targetAmountPaise) {
    return {
      planId: plan.id,
      planName: plan.name,
      baselineDate,
      simulatedDate: baselineDate,
      monthsSaved: 0,
    };
  }

  const simulatedPace = plan.averageMonthlySavingsPaise + extraMonthlyPaise;

  const simulatedDate = projectCompletionDate({
    currentAmountPaise: plan.currentAmountPaise,
    targetAmountPaise: plan.targetAmountPaise,
    monthlyContributionPaise: simulatedPace,
    referenceDate,
  });

  let monthsSaved: number | null = null;

  if (baselineDate && simulatedDate) {
    monthsSaved = Math.max(
      0,
      differenceInCalendarMonths(baselineDate, simulatedDate),
    );
  }

  return {
    planId: plan.id,
    planName: plan.name,
    baselineDate,
    simulatedDate,
    monthsSaved,
  };
}

export function simulateAllActivePlans(
  activePlans: InsightsPlan[],
  extraMonthlyPaise: number,
): SimulationResult[] {
  return activePlans.map((plan) =>
    simulateExtraMonthlySavings(plan, extraMonthlyPaise),
  );
}
