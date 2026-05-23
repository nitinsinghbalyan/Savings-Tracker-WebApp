"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";
import type { MonthlySavingsPoint } from "@/lib/dashboard/types";

type DashboardMonthlyChartProps = {
  data: MonthlySavingsPoint[];
};

function formatTooltipValue(savedPaise: number): string {
  return formatINR(savedPaise);
}

export function DashboardMonthlyChart({ data }: DashboardMonthlyChartProps) {
  const chartData = data.map((point) => ({
    month: point.month,
    saved: point.savedPaise / 100,
  }));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardDescription>Last 6 months</CardDescription>
        <CardTitle className="text-base">Monthly savings</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                formatter={(value) => {
                  const rupees = typeof value === "number" ? value : 0;
                  return [formatTooltipValue(Math.round(rupees * 100)), "Saved"];
                }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
              />
              <Bar
                dataKey="saved"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
