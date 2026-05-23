import { createClient } from "@/lib/supabase/server";

import type { SettingsData, UserProfile } from "./types";

export async function getSettingsData(): Promise<SettingsData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile: UserProfile = {
    id: user.id,
    email: user.email ?? "",
    fullName: profileRow?.full_name?.trim() ?? "",
    monthlyIncomePaise: profileRow?.monthly_income_paise ?? null,
    preferredSavingDay: profileRow?.preferred_saving_day ?? 1,
    currency: profileRow?.currency ?? "INR",
  };

  return { profile };
}
