import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InsightsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="size-7 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Insights unlock with plans</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create savings plans to get your health score, recommendations, and
        allocation suggestions.
      </p>
      <Link
        href="/plans/new"
        className={cn(buttonVariants(), "mt-6 inline-flex w-full justify-center")}
      >
        Create your first plan
      </Link>
    </div>
  );
}
