"use client";

import { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type { PlanWithStats, PlansTab } from "@/lib/plans/types";

import { PlanCard } from "./plan-card";

const TABS: { value: PlansTab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

const EMPTY_MESSAGES: Record<PlansTab, string> = {
  active: "No active plans. Completed or paused plans appear in other tabs.",
  completed: "No completed plans yet. Keep saving toward your targets.",
  paused: "No paused plans.",
};

type PlansViewProps = {
  plans: PlanWithStats[];
};

export function PlansView({ plans }: PlansViewProps) {
  const counts = useMemo(
    () =>
      TABS.reduce(
        (acc, { value }) => {
          acc[value] = filterPlansByTab(plans, value).length;
          return acc;
        },
        {} as Record<PlansTab, number>,
      ),
    [plans],
  );

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid h-auto min-h-11 w-full grid-cols-3 p-1">
        {TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="min-h-10 py-2 text-xs sm:text-sm">
            {label} ({counts[value]})
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map(({ value }) => {
        const tabPlans = filterPlansByTab(plans, value);

        return (
          <TabsContent key={value} value={value} className="mt-5">
            {tabPlans.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
                {EMPTY_MESSAGES[value]}
              </p>
            ) : (
              <ul className="space-y-4">
                {tabPlans.map((plan) => (
                  <li key={plan.id}>
                    <PlanCard plan={plan} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
