import Link from "next/link";
import { Trophy } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";
import type { InsightsPlan } from "@/lib/insights/types";

type InsightsMilestonesProps = {
  plans: InsightsPlan[];
};

export function InsightsMilestones({ plans }: InsightsMilestonesProps) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Trophy className="size-4 text-primary" />
        Completed milestones
      </h2>

      {plans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Completed goals will appear here when you reach your targets.
        </p>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link href={`/plans/${plan.id}`}>
                <Card className="border-border bg-card transition-colors active:bg-muted/30">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Target reached · {formatINR(plan.targetAmountPaise)}
                    </p>
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
