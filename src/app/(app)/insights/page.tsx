import { AppShell } from "@/components/layout/AppShell";
import { InsightsChartPlaceholder } from "@/components/insights/insights-chart-placeholder";

export default function InsightsPage() {
  return (
    <AppShell title="Insights">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Track savings trends, projections, and milestones across your plans.
        </p>
        <InsightsChartPlaceholder />
      </div>
    </AppShell>
  );
}
