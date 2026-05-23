import Link from "next/link";
import { Pencil } from "lucide-react";

import { PlanDetailActions } from "@/components/plans/plan-detail-actions";
import { PlanDetailHeader } from "@/components/plans/plan-detail-header";
import { PlanDetailStatCards } from "@/components/plans/plan-detail-stat-cards";
import { PlanMetaCard } from "@/components/plans/plan-meta-card";
import { PlanProgressRing } from "@/components/plans/plan-progress-ring";
import { PlanProjectionCard } from "@/components/plans/plan-projection-card";
import { PlanTransactionList } from "@/components/plans/plan-transaction-list";
import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { getPlanDetail } from "@/lib/plans/get-plan-detail";
import { cn } from "@/lib/utils";

type PlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;
  const plan = await getPlanDetail(id);
  const isComplete = plan.currentAmountPaise >= plan.targetAmountPaise;

  return (
    <AppShell
      title={plan.name}
      showBack
      backHref="/plans"
      rightSlot={
        <Link
          href={`/plans/${id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }))}
          aria-label="Edit plan"
        >
          <Pencil className="size-4" />
        </Link>
      }
    >
      <div className="page-content">
        <PlanDetailHeader plan={plan} />
        <PlanProgressRing
          percent={plan.progressPercent}
          color={plan.color}
        />
        <PlanDetailStatCards
          currentAmountPaise={plan.currentAmountPaise}
          targetAmountPaise={plan.targetAmountPaise}
          remainingAmountPaise={plan.remainingAmountPaise}
        />
        <PlanMetaCard
          targetDate={plan.targetDate}
          monthlyRequiredPaise={plan.monthlyRequiredPaise}
          isComplete={isComplete}
        />
        <PlanProjectionCard
          projectedCompletionDate={plan.projectedCompletionDate}
          isComplete={isComplete}
        />
        <PlanDetailActions planId={plan.id} />
        <PlanTransactionList transactions={plan.transactions} />
      </div>
    </AppShell>
  );
}
