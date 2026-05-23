import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type InsightsRecommendationsProps = {
  actions: string[];
};

export function InsightsRecommendations({ actions }: InsightsRecommendationsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recommended actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
