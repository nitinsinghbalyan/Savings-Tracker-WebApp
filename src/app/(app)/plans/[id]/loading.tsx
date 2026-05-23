import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function PlanDetailLoading() {
  return (
    <PageSkeleton title="Plan" variant="detail" showBack backHref="/plans" />
  );
}
