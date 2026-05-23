import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactINR, formatINR } from "@/lib/format-inr";

type DashboardHeroCardProps = {
  totalSavedPaise: number;
  activePlansCount: number;
  completedPlansCount: number;
  atRiskPlansCount: number;
};

function formatAmount(amountPaise: number): string {
  return amountPaise >= 1_00_000_00
    ? formatCompactINR(amountPaise)
    : formatINR(amountPaise);
}

export function DashboardHeroCard({
  totalSavedPaise,
  activePlansCount,
  completedPlansCount,
  atRiskPlansCount,
}: DashboardHeroCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/10">
      <CardHeader className="pb-2">
        <CardDescription>Total saved</CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight tabular-nums">
          {formatAmount(totalSavedPaise)}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 pt-0 text-center text-xs">
        <div>
          <p className="font-semibold text-foreground">{activePlansCount}</p>
          <p className="text-muted-foreground">Active</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{completedPlansCount}</p>
          <p className="text-muted-foreground">Completed</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{atRiskPlansCount}</p>
          <p className="text-muted-foreground">At risk</p>
        </div>
      </CardContent>
    </Card>
  );
}
