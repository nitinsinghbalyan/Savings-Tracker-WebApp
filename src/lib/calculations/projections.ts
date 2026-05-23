/**
 * Savings projection helpers. All amounts in paise.
 */

import { addMonths, startOfMonth } from "date-fns";

import { calculateRemainingAmount } from "./savings";

export type ProjectCompletionDateInput = {
  currentAmountPaise: number;
  targetAmountPaise: number;
  monthlyContributionPaise: number;
  referenceDate?: Date;
};

export function projectCompletionDate({
  currentAmountPaise,
  targetAmountPaise,
  monthlyContributionPaise,
  referenceDate = new Date(),
}: ProjectCompletionDateInput): Date | null {
  if (currentAmountPaise >= targetAmountPaise) {
    return referenceDate;
  }

  if (monthlyContributionPaise <= 0) {
    return null;
  }

  const remaining = calculateRemainingAmount(
    currentAmountPaise,
    targetAmountPaise,
  );
  const monthsNeeded = Math.ceil(remaining / monthlyContributionPaise);

  return addMonths(startOfMonth(referenceDate), monthsNeeded);
}
