import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactINR, formatINR } from "@/lib/format-inr";

type DashboardProgressCardProps = {
  overallProgressPercent: number;
  totalSavedPaise: number;
  totalTargetPaise: number;
};

function formatAmount(amountPaise: number): string {
  return amountPaise >= 1_00_000_00
    ? formatCompactINR(amountPaise)
    : formatINR(amountPaise);
}

export function DashboardProgressCard({
  overallProgressPercent,
  totalSavedPaise,
  totalTargetPaise,
}: DashboardProgressCardProps) {
  const progressWidth = Math.min(100, Math.max(0, overallProgressPercent));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardDescription>Overall progress</CardDescription>
        <CardTitle className="text-2xl font-bold tabular-nums">
          {overallProgressPercent}%
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatAmount(totalSavedPaise)} of {formatAmount(totalTargetPaise)}{" "}
          across all goals
        </p>
      </CardContent>
    </Card>
  );
}
