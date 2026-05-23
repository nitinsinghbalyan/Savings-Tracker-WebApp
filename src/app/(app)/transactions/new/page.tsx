import { Target } from "lucide-react";

import { TransactionForm } from "@/components/forms/transaction-form";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { TRANSACTION_TYPE_LABELS } from "@/config/transaction-options";
import type { TransactionType } from "@/lib/calculations/types";
import { getPlansWithStats } from "@/lib/plans/get-plans-with-stats";
import { parseTransactionType } from "@/lib/transactions/parse-transaction-type";

type NewTransactionPageProps = {
  searchParams: Promise<{ planId?: string; type?: string }>;
};

function pageTitleForType(type: TransactionType): string {
  switch (type) {
    case "WITHDRAWAL":
      return "Log withdrawal";
    case "ADJUSTMENT":
      return "Log adjustment";
    default:
      return "Log contribution";
  }
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { planId, type } = await searchParams;
  const { plans } = await getPlansWithStats();

  const transactionType = parseTransactionType(type);
  const returnToPlanDetail = Boolean(planId);
  const defaultPlanId =
    planId && plans.some((plan) => plan.id === planId) ? planId : undefined;
  const backHref = defaultPlanId ? `/plans/${defaultPlanId}` : "/dashboard";

  return (
    <AppShell
      title={pageTitleForType(transactionType)}
      showBack
      backHref={backHref}
    >
      {plans.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No plans yet"
          description={`Create a savings plan before logging a ${TRANSACTION_TYPE_LABELS[transactionType].toLowerCase()}.`}
          actionLabel="Create plan"
          actionHref="/plans/new"
        />
      ) : (
        <TransactionForm
          plans={plans}
          defaultPlanId={defaultPlanId}
          defaultTransactionType={transactionType}
          returnToPlanDetail={returnToPlanDetail}
        />
      )}
    </AppShell>
  );
}
