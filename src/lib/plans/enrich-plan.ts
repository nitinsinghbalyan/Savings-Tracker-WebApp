import {
  calculateAverageMonthlySavings,
  calculateMonthlyRequired,
  calculatePlanCurrentAmount,
  calculateProgress,
  calculateRemainingAmount,
  getPlanHealthStatus,
} from "@/lib/calculations/savings";
import { projectCompletionDate } from "@/lib/calculations/projections";
import type { SavingsTransaction, TransactionType } from "@/lib/calculations/types";

import type {
  PlanDetail,
  PlanTransaction,
  PlanWithStats,
  SavingsPlanRow,
  SavingsTransactionRow,
} from "./types";

export function mapTransactionRow(
  row: SavingsTransactionRow,
): SavingsTransaction {
  return {
    amountPaise: row.amount_paise,
    transactionType: row.transaction_type as TransactionType,
    transactionDate: row.transaction_date,
  };
}

export function mapTransactionRowToPlanTransaction(
  row: SavingsTransactionRow,
): PlanTransaction {
  return {
    id: row.id,
    amountPaise: row.amount_paise,
    transactionType: row.transaction_type as TransactionType,
    source: row.source,
    note: row.note,
    transactionDate: row.transaction_date,
  };
}

export function enrichPlanWithStats(
  plan: SavingsPlanRow,
  transactions: SavingsTransaction[],
): PlanWithStats {
  const targetAmountPaise = plan.target_amount_paise;
  const currentAmountPaise = calculatePlanCurrentAmount(transactions);
  const remainingAmountPaise = calculateRemainingAmount(
    currentAmountPaise,
    targetAmountPaise,
  );
  const progressPercent = calculateProgress(
    currentAmountPaise,
    targetAmountPaise,
  );
  const monthlyRequiredPaise =
    plan.target_date && currentAmountPaise < targetAmountPaise
      ? calculateMonthlyRequired(remainingAmountPaise, plan.target_date)
      : 0;
  const averageMonthlySavingsPaise =
    calculateAverageMonthlySavings(transactions);
  const healthStatus = getPlanHealthStatus({
    currentAmountPaise,
    targetAmountPaise,
    targetDate: plan.target_date,
    transactions,
    status: plan.status,
  });

  return {
    id: plan.id,
    name: plan.name,
    category: plan.category,
    priority: plan.priority,
    status: plan.status,
    targetAmountPaise,
    targetDate: plan.target_date,
    color: plan.color,
    currentAmountPaise,
    remainingAmountPaise,
    progressPercent,
    monthlyRequiredPaise,
    averageMonthlySavingsPaise,
    healthStatus,
  };
}

export function enrichPlanDetail(
  plan: SavingsPlanRow,
  transactionRows: SavingsTransactionRow[],
): PlanDetail {
  const savingsTransactions = transactionRows.map(mapTransactionRow);
  const stats = enrichPlanWithStats(plan, savingsTransactions);

  const projectedCompletionDate =
    stats.currentAmountPaise >= stats.targetAmountPaise
      ? null
      : projectCompletionDate({
          currentAmountPaise: stats.currentAmountPaise,
          targetAmountPaise: stats.targetAmountPaise,
          monthlyContributionPaise: stats.averageMonthlySavingsPaise,
        });

  const transactions = transactionRows
    .map(mapTransactionRowToPlanTransaction)
    .sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime(),
    );

  return {
    ...stats,
    description: plan.description,
    priority: plan.priority,
    icon: plan.icon,
    projectedCompletionDate,
    transactions,
  };
}
