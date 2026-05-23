"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { simulateAllActivePlans } from "@/lib/insights/simulate-extra-savings";
import type { InsightsPlan } from "@/lib/insights/types";

type InsightsSimulatorProps = {
  activePlans: InsightsPlan[];
};

function formatDate(date: Date | null): string {
  if (!date) {
    return "Not projected";
  }

  return format(date, "d MMM yyyy");
}

export function InsightsSimulator({ activePlans }: InsightsSimulatorProps) {
  const [extraRupees, setExtraRupees] = useState("");

  const extraMonthlyPaise = useMemo(() => {
    const parsed = Number.parseFloat(extraRupees);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }

    return Math.round(parsed * 100);
  }, [extraRupees]);

  const results = useMemo(
    () => simulateAllActivePlans(activePlans, extraMonthlyPaise),
    [activePlans, extraMonthlyPaise],
  );

  if (activePlans.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Extra savings simulator</CardTitle>
        <CardDescription>
          See how additional monthly savings could affect goal completion dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor="extraMonthlySavings">Extra monthly savings (₹)</Label>
          <Input
            id="extraMonthlySavings"
            type="number"
            min="0"
            step="100"
            placeholder="5000"
            value={extraRupees}
            onChange={(event) => setExtraRupees(event.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Suggestions allocate savings across your plans only. Not investment
          advice.
        </p>

        {extraMonthlyPaise > 0 ? (
          <ul className="space-y-2">
            {results.map((result) => (
              <li
                key={result.planId}
                className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
              >
                <p className="font-medium">{result.planName}</p>
                <p className="mt-1 text-muted-foreground">
                  {formatDate(result.baselineDate)} →{" "}
                  {formatDate(result.simulatedDate)}
                </p>
                {result.monthsSaved !== null && result.monthsSaved > 0 && (
                  <p className="mt-1 text-primary">
                    About {result.monthsSaved}{" "}
                    {result.monthsSaved === 1 ? "month" : "months"} sooner
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter an amount to simulate projected completion dates.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
