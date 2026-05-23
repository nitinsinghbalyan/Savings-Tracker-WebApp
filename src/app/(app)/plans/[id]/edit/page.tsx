import { AppShell } from "@/components/layout/AppShell";
import { PlanForm } from "@/components/forms/plan-form";

type EditPlanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;

  return (
    <AppShell title="Edit plan" showBack backHref={`/plans/${id}`}>
      <PlanForm
        submitLabel="Save changes"
        defaultValues={{
          name: "Sample plan",
          targetAmountRupees: 100000,
        }}
      />
    </AppShell>
  );
}
