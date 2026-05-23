import type { PlanWithStats } from "@/lib/plans/types";

export type DashboardSummary = {
  totalSavedPaise: number;
  totalTargetPaise: number;
  overallProgressPercent: number;
  savedThisMonthPaise: number;
  requiredThisMonthPaise: number;
  activePlansCount: number;
  completedPlansCount: number;
  atRiskPlansCount: number;
};

export type MonthlySavingsPoint = {
  month: string;
  savedPaise: number;
};

export type DashboardData = {
  greetingName: string;
  summary: DashboardSummary;
  activePlans: PlanWithStats[];
  chartData: MonthlySavingsPoint[];
  insights: string[];
};
