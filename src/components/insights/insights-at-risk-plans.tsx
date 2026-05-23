import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { PlanHealthBadge } from "@/components/plans/plan-health-badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";
import type { InsightsPlan } from "@/lib/insights/types";

type InsightsAtRiskPlansProps = {
  plans: InsightsPlan[];
};

export function InsightsAtRiskPlans({ plans }: InsightsAtRiskPlansProps) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <AlertTriangle className="size-4 text-amber-400" />
        At-risk plans
      </h2>

      {plans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          No at-risk plans right now. Keep up your savings pace.
        </p>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link href={`/plans/${plan.id}`}>
                <Card className="border-border bg-card transition-colors active:bg-muted/30">
                  <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {plan.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {formatINR(plan.currentAmountPaise)} saved ·{" "}
                        {plan.progressPercent}% of target
                      </p>
                    </div>
                    <PlanHealthBadge status={plan.healthStatus} />
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
