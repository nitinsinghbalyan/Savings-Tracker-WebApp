"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const transactionSchema = z.object({
  planId: z.string().min(1, "Select a savings plan"),
  amountRupees: z
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      planId: "",
      amountRupees: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
    },
  });

  function onSubmit(values: TransactionFormValues) {
    const amountPaise = Math.round(values.amountRupees * 100);
    console.log("Contribution save coming soon", { ...values, amountPaise });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="planId">Savings plan</Label>
        <Input
          id="planId"
          placeholder="Select a plan (coming soon)"
          {...register("planId")}
        />
        {errors.planId && (
          <p className="text-sm text-destructive">{errors.planId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amountRupees">Amount (₹)</Label>
        <Input
          id="amountRupees"
          type="number"
          min="1"
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
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="Monthly contribution"
          {...register("note")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Log contribution
      </Button>
    </form>
  );
}
