import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";

type PlanMetaCardProps = {
  targetDate: string | null;
  monthlyRequiredPaise: number;
  isComplete: boolean;
};

export function PlanMetaCard({
  targetDate,
  monthlyRequiredPaise,
  isComplete,
}: PlanMetaCardProps) {
  const targetDateLabel = targetDate
    ? format(new Date(targetDate), "d MMM yyyy")
    : "Not set";

  const monthlyRequiredLabel =
    !targetDate || isComplete || monthlyRequiredPaise <= 0
      ? "—"
      : formatINR(monthlyRequiredPaise);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Goal timeline</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-0 text-sm">
        <div>
          <p className="text-muted-foreground">Target date</p>
          <p className="mt-1 font-medium">{targetDateLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Monthly required</p>
          <p className="mt-1 font-medium tabular-nums">{monthlyRequiredLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
