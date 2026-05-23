import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TransactionType } from "@/lib/calculations/types";
import { formatINR } from "@/lib/format-inr";
import type { PlanTransaction } from "@/lib/plans/types";
import { cn } from "@/lib/utils";

type PlanTransactionListProps = {
  transactions: PlanTransaction[];
};

const TYPE_STYLES: Record<
  TransactionType,
  { label: string; amountClass: string; badgeClass: string }
> = {
  CONTRIBUTION: {
    label: "Contribution",
    amountClass: "text-primary",
    badgeClass: "bg-primary/15 text-primary",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    amountClass: "text-destructive",
    badgeClass: "bg-destructive/15 text-destructive",
  },
  ADJUSTMENT: {
    label: "Adjustment",
    amountClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

function formatSignedAmount(
  amountPaise: number,
  transactionType: TransactionType,
): string {
  const formatted = formatINR(amountPaise);

  switch (transactionType) {
    case "CONTRIBUTION":
      return `+${formatted}`;
    case "WITHDRAWAL":
      return `−${formatted}`;
    default:
      return formatted;
  }
}

export function PlanTransactionList({ transactions }: PlanTransactionListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Contribution history</h2>

      {transactions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
          No contributions yet. Add your first contribution above.
        </p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((transaction) => {
            const styles = TYPE_STYLES[transaction.transactionType];

            return (
              <li key={transaction.id}>
                <Card className="border-border bg-card">
                  <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 px-4 py-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle
                          className={cn(
                            "text-base font-semibold tabular-nums",
                            styles.amountClass,
                          )}
                        >
                          {formatSignedAmount(
                            transaction.amountPaise,
                            transaction.transactionType,
                          )}
                        </CardTitle>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            styles.badgeClass,
                          )}
                        >
                          {styles.label}
                        </span>
                      </div>
                      {transaction.source && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.source}
                        </p>
                      )}
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                    <CardContent className="shrink-0 p-0 text-xs text-muted-foreground">
                      {format(
                        new Date(transaction.transactionDate),
                        "d MMM yyyy",
                      )}
                    </CardContent>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
