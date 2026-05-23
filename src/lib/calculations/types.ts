export type TransactionType = "CONTRIBUTION" | "WITHDRAWAL" | "ADJUSTMENT";

export type SavingsTransaction = {
  amountPaise: number;
  transactionType: TransactionType;
  transactionDate: string | Date;
};

export type PlanHealthStatus =
  | "COMPLETED"
  | "ACTIVE"
  | "ON_TRACK"
  | "SLIGHTLY_BEHIND"
  | "CRITICAL"
  | "PAUSED";

export type PlanStatus = "Active" | "Paused" | string;

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
