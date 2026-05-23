import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HEALTH_SCORE_WEIGHTS } from "@/lib/insights/health-score";
import type { HealthScoreBreakdown } from "@/lib/insights/types";

type InsightsScoreCardProps = {
  healthScore: HealthScoreBreakdown;
};

const BREAKDOWN_ITEMS = [
  { key: "pace", label: "Savings pace", max: HEALTH_SCORE_WEIGHTS.pace },
  {
    key: "emergencyFund",
    label: "Emergency fund",
    max: HEALTH_SCORE_WEIGHTS.emergencyFund,
  },
  {
    key: "consistency",
    label: "Consistency",
    max: HEALTH_SCORE_WEIGHTS.consistency,
  },
  {
    key: "onTrackPlans",
    label: "On-track plans",
    max: HEALTH_SCORE_WEIGHTS.onTrackPlans,
  },
  {
    key: "lowWithdrawals",
    label: "Low withdrawals",
    max: HEALTH_SCORE_WEIGHTS.lowWithdrawals,
  },
] as const;

export function InsightsScoreCard({ healthScore }: InsightsScoreCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/10">
      <CardHeader className="pb-2">
        <CardDescription>Savings Health Score</CardDescription>
        <CardTitle className="text-4xl font-bold tabular-nums">
          {healthScore.total}
          <span className="text-lg font-normal text-muted-foreground">/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {BREAKDOWN_ITEMS.map(({ key, label, max }) => {
          const score = healthScore[key];
          const width = max > 0 ? Math.round((score / max) * 100) : 0;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">
                  {score}/{max}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
