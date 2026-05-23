import Link from "next/link";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactINR, formatINR } from "@/lib/format-inr";
import type { PlanWithStats } from "@/lib/plans/types";
import { cn } from "@/lib/utils";

import { PlanHealthBadge } from "./plan-health-badge";

type PlanCardProps = {
  plan: PlanWithStats;
};

function formatAmount(amountPaise: number): string {
  return amountPaise >= 1_00_000_00
    ? formatCompactINR(amountPaise)
    : formatINR(amountPaise);
}

function formatMonthlyRequired(plan: PlanWithStats): string {
  const isCompleted = plan.currentAmountPaise >= plan.targetAmountPaise;

  if (!plan.targetDate || isCompleted || plan.monthlyRequiredPaise <= 0) {
    return "—";
  }

  return formatAmount(plan.monthlyRequiredPaise);
}

export function PlanCard({ plan }: PlanCardProps) {
  const progressWidth = Math.min(100, Math.max(0, plan.progressPercent));
  const targetDateLabel = plan.targetDate
    ? format(new Date(plan.targetDate), "d MMM yyyy")
    : "No target date";

  return (
    <Link href={`/plans/${plan.id}`} className="block">
      <Card
        className={cn(
          "border-border bg-card transition-colors active:bg-muted/30",
          plan.color && "border-l-4",
        )}
        style={
          plan.color
            ? { borderLeftColor: plan.color }
            : undefined
        }
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{plan.name}</CardTitle>
              <CardDescription className="truncate">
                {plan.category}
              </CardDescription>
            </div>
            <PlanHealthBadge status={plan.healthStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-lg font-semibold tabular-nums">
            {formatAmount(plan.currentAmountPaise)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {formatAmount(plan.targetAmountPaise)}
            </span>
          </p>

          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.progressPercent}% saved
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground/80">Target date</p>
              <p>{targetDateLabel}</p>
            </div>
            <div>
              <p className="font-medium text-foreground/80">Monthly required</p>
              <p>{formatMonthlyRequired(plan)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
