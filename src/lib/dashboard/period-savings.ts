import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";

import { calculatePlanCurrentAmount } from "@/lib/calculations/savings";
import type { SavingsTransaction } from "@/lib/calculations/types";
import { toDate } from "@/lib/calculations/types";

import type { MonthlySavingsPoint } from "./types";

function transactionsInInterval(
  transactions: SavingsTransaction[],
  intervalStart: Date,
  intervalEnd: Date,
): SavingsTransaction[] {
  return transactions.filter((transaction) => {
    const date = toDate(transaction.transactionDate);
    return isWithinInterval(date, { start: intervalStart, end: intervalEnd });
  });
}

export function calculateNetSavingsInMonth(
  transactions: SavingsTransaction[],
  referenceDate: Date = new Date(),
): number {
  const intervalStart = startOfMonth(referenceDate);
  const intervalEnd = endOfMonth(referenceDate);

  return calculatePlanCurrentAmount(
    transactionsInInterval(transactions, intervalStart, intervalEnd),
  );
}

export function buildMonthlySavingsSeries(
  transactions: SavingsTransaction[],
  months = 6,
  referenceDate: Date = new Date(),
): MonthlySavingsPoint[] {
  const points: MonthlySavingsPoint[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = startOfMonth(subMonths(referenceDate, index));
    const intervalStart = startOfMonth(monthDate);
    const intervalEnd = endOfMonth(monthDate);

    points.push({
      month: format(monthDate, "MMM"),
      savedPaise: calculatePlanCurrentAmount(
        transactionsInInterval(transactions, intervalStart, intervalEnd),
      ),
    });
  }

  return points;
}
