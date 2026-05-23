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

const placeholderData = [
  { month: "Jan", saved: 12000 },
  { month: "Feb", saved: 18000 },
  { month: "Mar", saved: 24000 },
  { month: "Apr", saved: 31000 },
  { month: "May", saved: 38000 },
  { month: "Jun", saved: 45000 },
];

export function InsightsChartPlaceholder() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-4 text-sm text-muted-foreground">
        Sample savings trend — full insights coming soon
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={placeholderData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="saved" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
