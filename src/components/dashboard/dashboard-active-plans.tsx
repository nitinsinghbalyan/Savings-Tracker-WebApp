import Link from "next/link";

import { PlanCard } from "@/components/plans/plan-card";
import { buttonVariants } from "@/components/ui/button";
import type { PlanWithStats } from "@/lib/plans/types";
import { cn } from "@/lib/utils";

type DashboardActivePlansProps = {
  plans: PlanWithStats[];
};

export function DashboardActivePlans({ plans }: DashboardActivePlansProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Active plans</h2>
        <Link
          href="/plans"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {plans.map((plan) => (
          <li key={plan.id}>
            <PlanCard plan={plan} />
          </li>
        ))}
      </ul>
    </section>
  );
}
