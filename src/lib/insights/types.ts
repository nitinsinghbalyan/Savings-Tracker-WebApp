import type { MonthlySavingsPoint } from "@/lib/dashboard/types";
import type { PlanWithStats } from "@/lib/plans/types";

export type HealthScoreBreakdown = {
  total: number;
  pace: number;
  emergencyFund: number;
  consistency: number;
  onTrackPlans: number;
  lowWithdrawals: number;
};

export type InsightsPlan = PlanWithStats & {
  projectedCompletionDate: Date | null;
};

export type AllocationRecommendation = {
  planId: string;
  planName: string;
  amountPaise: number;
  reasons: string[];
};

export type SimulationResult = {
  planId: string;
  planName: string;
  baselineDate: Date | null;
  simulatedDate: Date | null;
  monthsSaved: number | null;
};

export type InsightsNarrative = {
  strengths: string[];
  weaknesses: string[];
  actions: string[];
};

export type InsightsData = {
  hasPlans: boolean;
  healthScore: HealthScoreBreakdown;
  narrative: InsightsNarrative;
  atRiskPlans: InsightsPlan[];
  completedPlans: InsightsPlan[];
  activePlans: InsightsPlan[];
  chartData: MonthlySavingsPoint[];
  positiveSavingsMonths: number;
  currentStreak: number;
};
