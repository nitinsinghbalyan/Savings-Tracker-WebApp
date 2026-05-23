"use server";

import { revalidatePath } from "next/cache";

import type { TransactionType } from "@/lib/calculations/types";
import { createClient } from "@/lib/supabase/server";

export type CreateTransactionInput = {
  planId: string;
  transactionType: TransactionType;
  amountPaise: number;
  transactionDate: string;
  source?: string;
  note?: string;
  returnToPlanDetail?: boolean;
};

export type ActionResult = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to log a transaction." };
  }

  const { data: plan, error: planError } = await supabase
    .from("savings_plans")
    .select("id")
    .eq("id", input.planId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError || !plan) {
    return { error: "Select a valid savings plan." };
  }

  const { error } = await supabase.from("savings_transactions").insert({
    user_id: user.id,
    plan_id: input.planId,
    amount_paise: input.amountPaise,
    transaction_type: input.transactionType,
    source: input.source?.trim() || null,
    note: input.note?.trim() || null,
    transaction_date: input.transactionDate,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath(`/plans/${input.planId}`);
  revalidatePath("/insights");

  return {
    success: true,
    redirectTo: input.returnToPlanDetail
      ? `/plans/${input.planId}`
      : "/dashboard",
  };
}
