import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

type PageSkeletonVariant = "dashboard" | "list" | "detail" | "form" | "default";

type PageSkeletonProps = {
  title?: string;
  variant?: PageSkeletonVariant;
  hideNav?: boolean;
  showBack?: boolean;
  backHref?: string;
};

export function PageSkeleton({
  title = "Loading…",
  variant = "default",
  hideNav = false,
  showBack = false,
  backHref = "/",
}: PageSkeletonProps) {
  return (
    <AppShell
      title={title}
      hideNav={hideNav}
      showBack={showBack}
      backHref={backHref}
    >
      <div className="page-content">
        {variant === "dashboard" && <DashboardSkeleton />}
        {variant === "list" && <ListSkeleton />}
        {variant === "detail" && <DetailSkeleton />}
        {variant === "form" && <FormSkeleton />}
        {variant === "default" && <DefaultSkeleton />}
      </div>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </>
  );
}

function ListSkeleton() {
  return (
    <>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-xl" />
      ))}
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="mx-auto size-36 rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </>
  );
}

function FormSkeleton() {
  return (
    <Skeleton className="h-[28rem] w-full rounded-xl" />
  );
}

function DefaultSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </>
  );
}
