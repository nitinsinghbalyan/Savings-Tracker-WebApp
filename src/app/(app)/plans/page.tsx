import { Target } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FloatingActionButton } from "@/components/shared/FloatingActionButton";

export default function PlansPage() {
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
        icon={Target}
        label="Create plan"
        href="/plans/new"
      />
    </AppShell>
  );
}
