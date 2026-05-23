import { DashboardMonthlyChart } from "@/components/dashboard/dashboard-monthly-chart";
import type { MonthlySavingsPoint } from "@/lib/dashboard/types";

type InsightsMonthlyChartProps = {
  data: MonthlySavingsPoint[];
};

export function InsightsMonthlyChart({ data }: InsightsMonthlyChartProps) {
  return <DashboardMonthlyChart data={data} />;
}
