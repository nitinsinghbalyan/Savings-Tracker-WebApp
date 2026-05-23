import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PlanNotFound() {
  return (
    <AppShell title="Plan not found" showBack backHref="/plans">
      <div className="space-y-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">This plan could not be found</h2>
        <p className="text-sm text-muted-foreground">
          It may have been deleted, or you may not have access to view it.
        </p>
        <Link
          href="/plans"
          className={cn(buttonVariants(), "mt-2 inline-flex justify-center")}
        >
          Back to plans
        </Link>
      </div>
    </AppShell>
  );
}
