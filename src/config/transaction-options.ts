import type { TransactionType } from "@/lib/calculations/types";

export const TRANSACTION_TYPES = [
  "CONTRIBUTION",
  "WITHDRAWAL",
  "ADJUSTMENT",
] as const satisfies readonly TransactionType[];

export const TRANSACTION_SOURCES = [
  "Salary",
  "Bonus",
  "Gift",
  "FD Maturity",
  "UPI",
  "Cash",
  "Investment Redemption",
  "Other",
] as const;

export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  CONTRIBUTION: "Contribution",
  WITHDRAWAL: "Withdrawal",
  ADJUSTMENT: "Adjustment",
};
