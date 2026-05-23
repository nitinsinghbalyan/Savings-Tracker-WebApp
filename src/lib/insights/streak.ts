import { startOfMonth, subMonths } from "date-fns";

import { calculateNetSavingsInMonth } from "@/lib/dashboard/period-savings";
import type { SavingsTransaction } from "@/lib/calculations/types";

export function countPositiveSavingsMonths(
  transactions: SavingsTransaction[],
  months = 6,
  referenceDate: Date = new Date(),
): number {
  let count = 0;

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = startOfMonth(subMonths(referenceDate, index));
    const net = calculateNetSavingsInMonth(transactions, monthDate);

    if (net > 0) {
      count += 1;
    }
  }

  return count;
}

export function calculateCurrentSavingsStreak(
  transactions: SavingsTransaction[],
  referenceDate: Date = new Date(),
): number {
  let streak = 0;

  for (let index = 0; index < 24; index += 1) {
    const monthDate = startOfMonth(subMonths(referenceDate, index));
    const net = calculateNetSavingsInMonth(transactions, monthDate);

    if (net > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}
