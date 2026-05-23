import { enrichPlanWithStats, mapTransactionRow } from "@/lib/plans/enrich-plan";
import { filterPlansByTab } from "@/lib/plans/filter-plans";
import type {
  SavingsPlanRow,
  SavingsTransactionRow,
} from "@/lib/plans/types";
import type { SavingsTransaction } from "@/lib/calculations/types";
import { createClient } from "@/lib/supabase/server";

import { aggregateDashboardMetrics } from "./aggregate-metrics";
import { generateDashboardInsights } from "./generate-insights";
import { buildMonthlySavingsSeries } from "./period-savings";
import type { DashboardData } from "./types";

const ACTIVE_PLANS_LIMIT = 4;

function resolveGreetingName(
  fullName: string | null | undefined,
  email: string | undefined,
): string {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName.split(/\s+/)[0] ?? trimmedName;
  }

  if (email) {
    const localPart = email.split("@")[0];
    if (localPart) {
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }

  return "there";
}

function emptyDashboard(greetingName: string): DashboardData {
  return {
    greetingName,
    summary: {
      totalSavedPaise: 0,
      totalTargetPaise: 0,
      overallProgressPercent: 0,
      savedThisMonthPaise: 0,
      requiredThisMonthPaise: 0,
      activePlansCount: 0,
      completedPlansCount: 0,
      atRiskPlansCount: 0,
    },
    activePlans: [],
    chartData: buildMonthlySavingsSeries([]),
    insights: [],
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyDashboard("there");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const greetingName = resolveGreetingName(
    profile?.full_name,
    user.email,
  );

  const { data: planRows } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: transactionRows } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("user_id", user.id);

  const allTransactions: SavingsTransaction[] = (
    (transactionRows ?? []) as SavingsTransactionRow[]
  ).map(mapTransactionRow);

  if (!planRows?.length) {
    return {
      ...emptyDashboard(greetingName),
      chartData: buildMonthlySavingsSeries(allTransactions),
    };
  }

  const transactionsByPlanId = new Map<string, SavingsTransaction[]>();

  for (const row of (transactionRows ?? []) as SavingsTransactionRow[]) {
    const mapped = mapTransactionRow(row);
    const existing = transactionsByPlanId.get(row.plan_id) ?? [];
    existing.push(mapped);
    transactionsByPlanId.set(row.plan_id, existing);
  }

  const plans = (planRows as SavingsPlanRow[]).map((plan) =>
    enrichPlanWithStats(plan, transactionsByPlanId.get(plan.id) ?? []),
  );

  const summary = aggregateDashboardMetrics(plans, allTransactions);
  const activePlans = filterPlansByTab(plans, "active").slice(
    0,
    ACTIVE_PLANS_LIMIT,
  );

  return {
    greetingName,
    summary,
    activePlans,
    chartData: buildMonthlySavingsSeries(allTransactions),
    insights: generateDashboardInsights(plans, summary),
  };
}
