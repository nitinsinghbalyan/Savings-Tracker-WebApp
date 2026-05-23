import Link from "next/link";
import { Pencil } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { formatINR } from "@/lib/format-inr";
import { cn } from "@/lib/utils";

type PlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell
      title="Plan details"
      showBack
      backHref="/plans"
      rightSlot={
        <Link
          href={`/plans/${id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          aria-label="Edit plan"
        >
          <Pencil className="size-4" />
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Plan ID</p>
          <p className="font-medium">{id}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="mt-1 text-2xl font-bold">{formatINR(35_000_000)}</p>
          <p className="text-sm text-muted-foreground">
            of {formatINR(100_000_000)} target
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[35%] rounded-full bg-primary" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Contribution history and projections coming soon.
        </p>
      </div>
    </AppShell>
  );
}
