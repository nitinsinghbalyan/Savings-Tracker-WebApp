import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanProjectionCardProps = {
  projectedCompletionDate: Date | null;
  isComplete: boolean;
};

export function PlanProjectionCard({
  projectedCompletionDate,
  isComplete,
}: PlanProjectionCardProps) {
  let body: string;

  if (isComplete) {
    body = "Goal reached. Great work staying on track with this savings plan.";
  } else if (projectedCompletionDate) {
    body = `At your recent pace, you may reach this goal by ${format(projectedCompletionDate, "d MMM yyyy")}.`;
  } else {
    body =
      "Add contributions to see a projected completion date based on your savings pace.";
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Projection</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
