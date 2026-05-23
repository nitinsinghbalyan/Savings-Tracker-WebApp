import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  subtext,
  trend,
  trendPositive,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </CardTitle>
      </CardHeader>
      {(subtext || trend) && (
        <CardContent className="pt-0">
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trendPositive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {trend}
            </p>
          )}
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
