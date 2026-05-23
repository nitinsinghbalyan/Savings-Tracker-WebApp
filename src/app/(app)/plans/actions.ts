"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CreatePlanInput = {
  name: string;
  description?: string;
  category: string;
  targetAmountPaise: number;
  targetDate?: string;
  priority: string;
  icon?: string;
  color?: string;
};

export async function createPlan(
  input: CreatePlanInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a plan." };
  }

  const { error } = await supabase.from("savings_plans").insert({
    user_id: user.id,
    name: input.name,
    description: input.description?.trim() || null,
    category: input.category,
    target_amount_paise: input.targetAmountPaise,
    target_date: input.targetDate || null,
    priority: input.priority,
    icon: input.icon?.trim() || null,
    color: input.color?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/plans");
}
