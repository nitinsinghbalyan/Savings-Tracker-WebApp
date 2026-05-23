import { Plus, Target } from "lucide-react";

import { PlansView } from "@/components/plans/plans-view";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FloatingActionButton } from "@/components/shared/FloatingActionButton";
import { getPlansWithStats } from "@/lib/plans/get-plans-with-stats";

export default async function PlansPage() {
  const { plans } = await getPlansWithStats();

  if (plans.length === 0) {
    return (
      <AppShell title="Plans">
        <EmptyState
          icon={Target}
          title="No savings plans yet"
          description="Create your first plan to start tracking progress toward your goals."
          actionLabel="Create plan"
          actionHref="/plans/new"
        />
        <FloatingActionButton
          icon={Plus}
          label="Create plan"
          href="/plans/new"
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Plans">
      <PlansView plans={plans} />
      <FloatingActionButton
        icon={Plus}
        label="Create plan"
        href="/plans/new"
      />
    </AppShell>
  );
}
