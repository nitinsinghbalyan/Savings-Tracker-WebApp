import type { PlanDetail } from "@/lib/plans/types";

import { PlanHealthBadge } from "./plan-health-badge";

type PlanDetailHeaderProps = {
  plan: Pick<PlanDetail, "name" | "category" | "healthStatus">;
};

export function PlanDetailHeader({ plan }: PlanDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold tracking-tight">{plan.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{plan.category}</p>
      </div>
      <PlanHealthBadge status={plan.healthStatus} />
    </div>
  );
}
