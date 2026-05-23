import { Lightbulb } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardInsightsCardProps = {
  insights: string[];
};

export function DashboardInsightsCard({
  insights,
}: DashboardInsightsCardProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Lightbulb className="size-4 text-primary" />
        <CardTitle className="text-base">Insights</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
