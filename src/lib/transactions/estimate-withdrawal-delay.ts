import { differenceInCalendarMonths } from "date-fns";

import { projectCompletionDate } from "@/lib/calculations/projections";

export type WithdrawalDelayEstimate =
  | {
      kind: "delay";
      delayMonths: number;
      projectedCompletionBefore: Date;
      projectedCompletionAfter: Date;
    }
  | { kind: "message"; message: string };

export type EstimateWithdrawalDelayInput = {
  currentAmountPaise: number;
  targetAmountPaise: number;
  withdrawalAmountPaise: number;
  averageMonthlySavingsPaise: number;
  referenceDate?: Date;
};

export function estimateWithdrawalDelayImpact({
  currentAmountPaise,
  targetAmountPaise,
  withdrawalAmountPaise,
  averageMonthlySavingsPaise,
  referenceDate = new Date(),
}: EstimateWithdrawalDelayInput): WithdrawalDelayEstimate | null {
  if (withdrawalAmountPaise <= 0) {
    return null;
  }

  if (currentAmountPaise >= targetAmountPaise) {
    return {
      kind: "message",
      message: "This plan has already reached its target.",
    };
  }

  if (averageMonthlySavingsPaise <= 0) {
    return {
      kind: "message",
      message:
        "We need recent contribution history to estimate delay. This withdrawal will still reduce your saved balance.",
    };
  }

  const projectedCompletionBefore = projectCompletionDate({
    currentAmountPaise,
    targetAmountPaise,
    monthlyContributionPaise: averageMonthlySavingsPaise,
    referenceDate,
  });

  const projectedCompletionAfter = projectCompletionDate({
    currentAmountPaise: Math.max(0, currentAmountPaise - withdrawalAmountPaise),
    targetAmountPaise,
    monthlyContributionPaise: averageMonthlySavingsPaise,
    referenceDate,
  });

  if (!projectedCompletionBefore || !projectedCompletionAfter) {
    return {
      kind: "message",
      message:
        "Unable to project a completion date. This withdrawal will reduce progress toward your goal.",
    };
  }

  const delayMonths = Math.max(
    0,
    differenceInCalendarMonths(
      projectedCompletionAfter,
      projectedCompletionBefore,
    ),
  );

  return {
    kind: "delay",
    delayMonths,
    projectedCompletionBefore,
    projectedCompletionAfter,
  };
}
