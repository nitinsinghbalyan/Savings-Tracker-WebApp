import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";

type DashboardMonthCardProps = {
  savedThisMonthPaise: number;
  requiredThisMonthPaise: number;
};

export function DashboardMonthCard({
  savedThisMonthPaise,
  requiredThisMonthPaise,
}: DashboardMonthCardProps) {
  const hasRequired = requiredThisMonthPaise > 0;
  const monthProgress = hasRequired
    ? Math.min(
        100,
        Math.round((savedThisMonthPaise / requiredThisMonthPaise) * 100),
      )
    : 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardDescription>This month</CardDescription>
        <CardTitle className="text-xl font-bold tabular-nums">
          {formatINR(savedThisMonthPaise)} saved
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-sm text-muted-foreground">
          {hasRequired
            ? `${formatINR(requiredThisMonthPaise)} required across active goals`
            : "No monthly targets set on active goals"}
        </p>
        {hasRequired && (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${monthProgress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
