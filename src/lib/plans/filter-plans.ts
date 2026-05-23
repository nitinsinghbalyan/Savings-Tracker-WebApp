import type { PlanWithStats, PlansTab } from "./types";

function isPaused(plan: Pick<PlanWithStats, "status">): boolean {
  return plan.status.toLowerCase() === "paused";
}

function isCompleted(
  plan: Pick<PlanWithStats, "currentAmountPaise" | "targetAmountPaise">,
): boolean {
  return plan.currentAmountPaise >= plan.targetAmountPaise;
}

export function filterPlansByTab<T extends PlanWithStats>(
  plans: T[],
  tab: PlansTab,
): T[] {
  switch (tab) {
    case "paused":
      return plans.filter(isPaused);
    case "completed":
      return plans.filter((plan) => !isPaused(plan) && isCompleted(plan));
    case "active":
      return plans.filter((plan) => !isPaused(plan) && !isCompleted(plan));
  }
}
