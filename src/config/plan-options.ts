export const PLAN_CATEGORIES = [
  "Emergency Fund",
  "Vacation",
  "House",
  "Car/Bike",
  "Child Education",
  "Investment Goal",
  "Gadget",
  "Wedding/Event",
  "Custom",
] as const;

export const PLAN_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export type PlanCategory = (typeof PLAN_CATEGORIES)[number];
export type PlanPriority = (typeof PLAN_PRIORITIES)[number];

export const DEFAULT_PLAN_CATEGORY: PlanCategory = "Custom";
export const DEFAULT_PLAN_PRIORITY: PlanPriority = "Medium";

export const PLAN_COLOR_PRESETS = [
  { label: "Emerald", value: "#10B981" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Rose", value: "#F43F5E" },
] as const;
