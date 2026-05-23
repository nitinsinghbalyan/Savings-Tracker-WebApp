/**
 * Pure savings calculation helpers.
 * All amounts in paise. No UI or Supabase dependencies.
 *
 * Edge cases:
 * - Empty transactions → current = 0, avg savings = 0
 * - Target = 0 → progress = 0, remaining = 0
 * - Past target date → months remaining = 0; health = CRITICAL if incomplete
 * - Negative ADJUSTMENT → reduces balance correctly
 */

import {
  differenceInCalendarMonths,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";

import type {
  PlanHealthStatus,
  PlanStatus,
  SavingsTransaction,
} from "./types";
import { toDate } from "./types";

export const ON_TRACK_THRESHOLD = 0.95;
export const SLIGHTLY_BEHIND_THRESHOLD = 0.7;

export function calculatePlanCurrentAmount(
  transactions: SavingsTransaction[],
): number {
  return transactions.reduce((total, transaction) => {
    const { amountPaise, transactionType } = transaction;

    switch (transactionType) {
      case "CONTRIBUTION":
        return total + amountPaise;
      case "WITHDRAWAL":
        return total - amountPaise;
      case "ADJUSTMENT":
        return total + amountPaise;
      default:
        return total;
    }
  }, 0);
}

export function calculateProgress(
  currentAmountPaise: number,
  targetAmountPaise: number,
): number {
  if (targetAmountPaise <= 0) {
    return 0;
  }

  const percentage = (currentAmountPaise / targetAmountPaise) * 100;
  const clamped = Math.min(100, Math.max(0, percentage));

  return Math.round(clamped * 100) / 100;
}

export function calculateRemainingAmount(
  currentAmountPaise: number,
  targetAmountPaise: number,
): number {
  return Math.max(0, targetAmountPaise - currentAmountPaise);
}

export function calculateMonthsRemaining(
  targetDate: string | Date,
  referenceDate: Date = new Date(),
): number {
  const target = startOfDay(toDate(targetDate));
  const reference = startOfDay(referenceDate);

  if (target < reference) {
    return 0;
  }

  const months = differenceInCalendarMonths(target, reference);

  return months === 0 ? 1 : months;
}

export function calculateMonthlyRequired(
  remainingAmountPaise: number,
  targetDate: string | Date,
  referenceDate: Date = new Date(),
): number {
  if (remainingAmountPaise <= 0) {
    return 0;
  }

  const months = calculateMonthsRemaining(targetDate, referenceDate);

  if (months === 0) {
    return remainingAmountPaise;
  }

  return Math.ceil(remainingAmountPaise / months);
}

export function calculateAverageMonthlySavings(
  transactions: SavingsTransaction[],
  monthsWindow = 6,
  referenceDate: Date = new Date(),
): number {
  if (monthsWindow <= 0) {
    return 0;
  }

  const windowStart = startOfMonth(
    subMonths(referenceDate, monthsWindow - 1),
  );

  const transactionsInWindow = transactions.filter((transaction) => {
    const date = startOfDay(toDate(transaction.transactionDate));
    return date >= windowStart;
  });

  if (transactionsInWindow.length === 0) {
    return 0;
  }

  const netSavings = calculatePlanCurrentAmount(transactionsInWindow);

  return Math.round(netSavings / monthsWindow);
}

export type GetPlanHealthStatusInput = {
  currentAmountPaise: number;
  targetAmountPaise: number;
  targetDate?: string | Date | null;
  transactions: SavingsTransaction[];
  status: PlanStatus;
  referenceDate?: Date;
};

export function getPlanHealthStatus({
  currentAmountPaise,
  targetAmountPaise,
  targetDate,
  transactions,
  status,
  referenceDate = new Date(),
}: GetPlanHealthStatusInput): PlanHealthStatus {
  if (status.toLowerCase() === "paused") {
    return "PAUSED";
  }

  if (currentAmountPaise >= targetAmountPaise) {
    return "COMPLETED";
  }

  if (!targetDate) {
    return "ACTIVE";
  }

  const target = startOfDay(toDate(targetDate));
  const reference = startOfDay(referenceDate);

  if (target < reference) {
    return "CRITICAL";
  }

  const remaining = calculateRemainingAmount(
    currentAmountPaise,
    targetAmountPaise,
  );
  const requiredMonthly = calculateMonthlyRequired(
    remaining,
    targetDate,
    referenceDate,
  );
  const averageMonthly = calculateAverageMonthlySavings(
    transactions,
    6,
    referenceDate,
  );

  if (requiredMonthly <= 0) {
    return "ON_TRACK";
  }

  const paceRatio = averageMonthly / requiredMonthly;

  if (paceRatio >= ON_TRACK_THRESHOLD) {
    return "ON_TRACK";
  }

  if (paceRatio >= SLIGHTLY_BEHIND_THRESHOLD) {
    return "SLIGHTLY_BEHIND";
  }

  return "CRITICAL";
}
