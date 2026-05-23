import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactINR, formatINR } from "@/lib/format-inr";
import { cn } from "@/lib/utils";

type PlanDetailStatCardsProps = {
  currentAmountPaise: number;
  targetAmountPaise: number;
  remainingAmountPaise: number;
  className?: string;
};

function formatAmount(amountPaise: number): string {
  return amountPaise >= 1_00_000_00
    ? formatCompactINR(amountPaise)
    : formatINR(amountPaise);
}

export function PlanDetailStatCards({
  currentAmountPaise,
  targetAmountPaise,
  remainingAmountPaise,
  className,
}: PlanDetailStatCardsProps) {
  const stats = [
    { label: "Saved", value: formatAmount(currentAmountPaise) },
    { label: "Target", value: formatAmount(targetAmountPaise) },
    { label: "Remaining", value: formatAmount(remainingAmountPaise) },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardHeader className="px-3 pb-1 pt-3">
            <CardDescription className="text-xs">{stat.label}</CardDescription>
            <CardTitle className="text-base font-bold tabular-nums">
              {stat.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
