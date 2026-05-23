import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InsightsNarrative } from "@/lib/insights/types";

type InsightsStrengthsWeaknessesProps = {
  narrative: Pick<InsightsNarrative, "strengths" | "weaknesses">;
};

export function InsightsStrengthsWeaknesses({
  narrative,
}: InsightsStrengthsWeaknessesProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary">Strengths</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {narrative.strengths.length === 0 ? (
            <p className="text-sm text-muted-foreground">No strengths yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {narrative.strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-400">Weaknesses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {narrative.weaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No major gaps right now.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {narrative.weaknesses.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
