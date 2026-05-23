import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { formatCompactINR, formatINR } from "@/lib/format-inr";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Total saved</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatINR(125_000_000)}
          </p>
        </div>

        <div className="grid gap-4">
          <StatCard
            label="Active plans"
            value="3"
            subtext="Across emergency, travel, and home goals"
          />
          <StatCard
            label="This month"
            value={formatCompactINR(4_500_000)}
            trend="+12% vs last month"
            trendPositive
          />
          <StatCard
            label="Next milestone"
            value={formatINR(150_000_000)}
            subtext="Home down payment target"
          />
        </div>
      </div>
    </AppShell>
  );
}
