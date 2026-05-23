"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";
import { recommendAllocation } from "@/lib/insights/recommend-allocation";
import type { InsightsPlan } from "@/lib/insights/types";

type InsightsAllocationProps = {
  activePlans: InsightsPlan[];
};

export function InsightsAllocation({ activePlans }: InsightsAllocationProps) {
  const [availableRupees, setAvailableRupees] = useState("");

  const availablePaise = useMemo(() => {
    const parsed = Number.parseFloat(availableRupees);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }

    return Math.round(parsed * 100);
  }, [availableRupees]);

  const recommendations = useMemo(
    () => recommendAllocation(availablePaise, activePlans),
    [activePlans, availablePaise],
  );

  const allocatedTotal = recommendations.reduce(
    (sum, item) => sum + item.amountPaise,
    0,
  );

  if (activePlans.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly allocation</CardTitle>
        <CardDescription>
          Suggested split based on priority, emergency fund, target dates, and
          progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor="availableSavings">Available to save this month (₹)</Label>
          <Input
            id="availableSavings"
            type="number"
            min="0"
            step="100"
            placeholder="10000"
            value={availableRupees}
            onChange={(event) => setAvailableRupees(event.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Recommendations only move money between your savings plans. Not
          investment advice.
        </p>

        {availablePaise > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Allocating {formatINR(allocatedTotal)} of {formatINR(availablePaise)}
            </p>
            <ul className="space-y-2">
              {recommendations.map((item) => (
                <li
                  key={item.planId}
                  className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <p className="font-medium">
                    {formatINR(item.amountPaise)} → {item.planName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.reasons.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
            {allocatedTotal < availablePaise && (
              <p className="text-sm text-muted-foreground">
                {formatINR(availablePaise - allocatedTotal)} unallocated — your
                active goals may already be funded for this month.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter how much you can save this month to see a suggested allocation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
