import { TRANSACTION_TYPES } from "@/config/transaction-options";
import type { TransactionType } from "@/lib/calculations/types";

export function parseTransactionType(value?: string): TransactionType {
  if (value && TRANSACTION_TYPES.includes(value as TransactionType)) {
    return value as TransactionType;
  }

  return "CONTRIBUTION";
}
