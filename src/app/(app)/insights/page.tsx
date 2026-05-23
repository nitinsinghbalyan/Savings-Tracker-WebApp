import { AppShell } from "@/components/layout/AppShell";
import { InsightsAllocation } from "@/components/insights/insights-allocation";
import { InsightsAtRiskPlans } from "@/components/insights/insights-at-risk-plans";
import { InsightsEmptyState } from "@/components/insights/insights-empty-state";
import { InsightsMilestones } from "@/components/insights/insights-milestones";
import { InsightsMonthlyChart } from "@/components/insights/insights-monthly-chart";
import { InsightsRecommendations } from "@/components/insights/insights-recommendations";
import { InsightsScoreCard } from "@/components/insights/insights-score-card";
import { InsightsSimulator } from "@/components/insights/insights-simulator";
import { InsightsStrengthsWeaknesses } from "@/components/insights/insights-strengths-weaknesses";
import { getInsightsData } from "@/lib/insights/get-insights-data";

export default async function InsightsPage() {
  const data = await getInsightsData();
  return (
    <AppShell title="Insights">
      <div className="page-content">
        {!data.hasPlans ? (
          <InsightsEmptyState />
        ) : (
          <>
            <InsightsScoreCard healthScore={data.healthScore} />
            <InsightsStrengthsWeaknesses narrative={data.narrative} />
            <InsightsRecommendations actions={data.narrative.actions} />
            <InsightsMonthlyChart data={data.chartData} />
            <InsightsAtRiskPlans plans={data.atRiskPlans} />
            <InsightsMilestones plans={data.completedPlans} />
            <InsightsSimulator activePlans={data.activePlans} />
            <InsightsAllocation activePlans={data.activePlans} />
          </>
        )}
      </div>
    </AppShell>
  );
}
