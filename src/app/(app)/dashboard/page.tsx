import { AppShell } from "@/components/layout/AppShell";
import { DashboardActivePlans } from "@/components/dashboard/dashboard-active-plans";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { DashboardHeroCard } from "@/components/dashboard/dashboard-hero-card";
import { DashboardInsightsCard } from "@/components/dashboard/dashboard-insights-card";
import { DashboardMonthCard } from "@/components/dashboard/dashboard-month-card";
import { DashboardMonthlyChart } from "@/components/dashboard/dashboard-monthly-chart";
import { DashboardProgressCard } from "@/components/dashboard/dashboard-progress-card";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hasPlans =
    data.summary.activePlansCount > 0 || data.summary.completedPlansCount > 0;

  return (
    <AppShell title="Dashboard">
      <div className="page-content">
        <DashboardGreeting name={data.greetingName} />

        {!hasPlans ? (
          <DashboardEmptyState />
        ) : (
          <>
            <DashboardHeroCard
              totalSavedPaise={data.summary.totalSavedPaise}
              activePlansCount={data.summary.activePlansCount}
              completedPlansCount={data.summary.completedPlansCount}
              atRiskPlansCount={data.summary.atRiskPlansCount}
            />
            <DashboardProgressCard
              overallProgressPercent={data.summary.overallProgressPercent}
              totalSavedPaise={data.summary.totalSavedPaise}
              totalTargetPaise={data.summary.totalTargetPaise}
            />
            <DashboardMonthCard
              savedThisMonthPaise={data.summary.savedThisMonthPaise}
              requiredThisMonthPaise={data.summary.requiredThisMonthPaise}
            />
            <DashboardQuickActions />
            <DashboardMonthlyChart data={data.chartData} />
            {data.activePlans.length > 0 && (
              <DashboardActivePlans plans={data.activePlans} />
            )}
            <DashboardInsightsCard insights={data.insights} />
          </>
        )}
      </div>
    </AppShell>
  );
}
