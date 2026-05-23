import { AppShell } from "@/components/layout/AppShell";
import { PlanForm } from "@/components/forms/plan-form";

export default function NewPlanPage() {
  return (
    <AppShell title="New plan" showBack backHref="/plans">
      <PlanForm submitLabel="Create plan" />
    </AppShell>
  );
}
