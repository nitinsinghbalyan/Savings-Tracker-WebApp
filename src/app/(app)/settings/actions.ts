"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildPlansCsv, buildTransactionsCsv } from "@/lib/settings/csv";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileInput = {
  fullName: string;
  monthlyIncomePaise: number | null;
  preferredSavingDay: number;
};

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ error?: string; success?: boolean }> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  if (input.preferredSavingDay < 1 || input.preferredSavingDay > 31) {
    return { error: "Preferred saving day must be between 1 and 31." };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: input.fullName.trim() || null,
    monthly_income_paise: input.monthlyIncomePaise,
    preferred_saving_day: input.preferredSavingDay,
    currency: "INR",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function exportTransactionsCsv(): Promise<
  { csv: string; filename: string } | { error: string }
> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "You must be signed in to export data." };
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (transactionsError) {
    return { error: transactionsError.message };
  }

  const { data: plans } = await supabase
    .from("savings_plans")
    .select("id, name")
    .eq("user_id", user.id);

  const planNames = new Map(
    (plans ?? []).map((plan) => [plan.id, plan.name as string]),
  );

  const csv = buildTransactionsCsv(
    (transactions ?? []).map((row) => ({
      planName: planNames.get(row.plan_id) ?? "Unknown plan",
      amountPaise: row.amount_paise,
      transactionType: row.transaction_type,
      source: row.source,
      note: row.note,
      transactionDate: row.transaction_date,
      createdAt: row.created_at,
    })),
  );

  return {
    csv,
    filename: `rupeerise-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function exportPlansCsv(): Promise<
  { csv: string; filename: string } | { error: string }
> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "You must be signed in to export data." };
  }

  const { data: plans, error: plansError } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (plansError) {
    return { error: plansError.message };
  }

  const csv = buildPlansCsv(
    (plans ?? []).map((row) => ({
      name: row.name,
      category: row.category,
      targetAmountPaise: row.target_amount_paise,
      targetDate: row.target_date,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at,
    })),
  );

  return {
    csv,
    filename: `rupeerise-plans-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function deleteAllTransactions(): Promise<{ error?: string; success?: boolean }> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("savings_transactions")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/insights");

  return { success: true };
}

export async function deleteAllPlans(): Promise<{ error?: string; success?: boolean }> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("savings_plans")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/insights");

  return { success: true };
}
