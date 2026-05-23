"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertTriangle, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createTransaction } from "@/app/(app)/transactions/actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TRANSACTION_SOURCES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
} from "@/config/transaction-options";
import type { TransactionType } from "@/lib/calculations/types";
import { formatINR } from "@/lib/format-inr";
import type { PlanWithStats } from "@/lib/plans/types";
import { estimateWithdrawalDelayImpact } from "@/lib/transactions/estimate-withdrawal-delay";
import { mobileSelectClassName } from "@/lib/form-styles";

const transactionSchema = z.object({
  planId: z.string().min(1, "Select a savings plan"),
  transactionType: z.enum(TRANSACTION_TYPES),
  amountRupees: z
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  transactionDate: z.string().min(1, "Date is required"),
  source: z.string().optional(),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const fieldSelectClassName = mobileSelectClassName;

type TransactionFormProps = {
  plans: PlanWithStats[];
  defaultPlanId?: string;
  defaultTransactionType?: TransactionType;
  returnToPlanDetail?: boolean;
};

function submitLabelForType(type: TransactionType): string {
  switch (type) {
    case "WITHDRAWAL":
      return "Log withdrawal";
    case "ADJUSTMENT":
      return "Save adjustment";
    default:
      return "Log contribution";
  }
}

export function TransactionForm({
  plans,
  defaultPlanId,
  defaultTransactionType = "CONTRIBUTION",
  returnToPlanDetail = false,
}: TransactionFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      planId: defaultPlanId ?? "",
      transactionType: defaultTransactionType,
      amountRupees: undefined,
      transactionDate: format(new Date(), "yyyy-MM-dd"),
      source: "",
      note: "",
    },
  });

  const transactionType = watch("transactionType");
  const planId = watch("planId");
  const amountRupees = watch("amountRupees");

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === planId),
    [plans, planId],
  );

  const withdrawalImpact = useMemo(() => {
    if (transactionType !== "WITHDRAWAL" || !selectedPlan) {
      return null;
    }

    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return null;
    }

    const amountPaise = Math.round(amountRupees * 100);

    return estimateWithdrawalDelayImpact({
      currentAmountPaise: selectedPlan.currentAmountPaise,
      targetAmountPaise: selectedPlan.targetAmountPaise,
      withdrawalAmountPaise: amountPaise,
      averageMonthlySavingsPaise: selectedPlan.averageMonthlySavingsPaise,
    });
  }, [amountRupees, selectedPlan, transactionType]);

  async function onSubmit(values: TransactionFormValues) {
    setSubmitError(null);

    const amountPaise = Math.round(values.amountRupees * 100);

    const result = await createTransaction({
      planId: values.planId,
      transactionType: values.transactionType,
      amountPaise,
      transactionDate: values.transactionDate,
      source: values.source?.trim() || undefined,
      note: values.note?.trim() || undefined,
      returnToPlanDetail,
    });

    if (result?.error) {
      toast.error("Could not save transaction", { description: result.error });
      setSubmitError(result.error);
      return;
    }

    toast.success("Transaction saved");
    router.push(result.redirectTo ?? "/dashboard");
    router.refresh();
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No plans yet"
        description="Create a savings plan before logging contributions or withdrawals."
        actionLabel="Create plan"
        actionHref="/plans/new"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="planId">Savings plan</Label>
        <select
          id="planId"
          className={fieldSelectClassName}
          {...register("planId")}
        >
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
        {errors.planId && (
          <p className="text-sm text-destructive">{errors.planId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionType">Transaction type</Label>
        <select
          id="transactionType"
          className={fieldSelectClassName}
          {...register("transactionType")}
        >
          {TRANSACTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {TRANSACTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amountRupees">Amount (₹)</Label>
        <Input
          id="amountRupees"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="5000"
          {...register("amountRupees", { valueAsNumber: true })}
        />
        {errors.amountRupees && (
          <p className="text-sm text-destructive">
            {errors.amountRupees.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionDate">Date</Label>
        <Input
          id="transactionDate"
          type="date"
          {...register("transactionDate")}
        />
        {errors.transactionDate && (
          <p className="text-sm text-destructive">
            {errors.transactionDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source (optional)</Label>
        <select
          id="source"
          className={fieldSelectClassName}
          {...register("source")}
        >
          <option value="">Select source</option>
          {TRANSACTION_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          UPI and other sources are labels only — no payment is processed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="Monthly contribution"
          {...register("note")}
        />
      </div>

      {withdrawalImpact && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium text-amber-50">Withdrawal impact</p>
            {withdrawalImpact.kind === "delay" ? (
              <>
                <p>
                  This withdrawal of{" "}
                  {formatINR(Math.round((amountRupees ?? 0) * 100))}{" "}
                  may delay your goal by about{" "}
                  <span className="font-semibold">
                    {withdrawalImpact.delayMonths}{" "}
                    {withdrawalImpact.delayMonths === 1 ? "month" : "months"}
                  </span>
                  , based on your recent savings pace.
                </p>
                <p className="text-amber-200/80">
                  Projected completion:{" "}
                  {format(
                    withdrawalImpact.projectedCompletionBefore,
                    "d MMM yyyy",
                  )}{" "}
                  →{" "}
                  {format(
                    withdrawalImpact.projectedCompletionAfter,
                    "d MMM yyyy",
                  )}
                </p>
              </>
            ) : (
              <p>{withdrawalImpact.message}</p>
            )}
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <Button type="submit" size="touch" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving…"
          : submitLabelForType(transactionType as TransactionType)}
      </Button>
    </form>
  );
}
