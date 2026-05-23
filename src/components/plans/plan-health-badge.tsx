import type { PlanHealthStatus } from "@/lib/calculations/types";
import { cn } from "@/lib/utils";

const HEALTH_CONFIG: Record<
  PlanHealthStatus,
  { label: string; className: string }
> = {
  ON_TRACK: {
    label: "On track",
    className: "bg-primary/15 text-primary",
  },
  SLIGHTLY_BEHIND: {
    label: "Slightly behind",
    className: "bg-amber-500/15 text-amber-400",
  },
  CRITICAL: {
    label: "Critical",
    className: "bg-destructive/15 text-destructive",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-secondary text-secondary-foreground",
  },
  PAUSED: {
    label: "Paused",
    className: "border border-border bg-transparent text-muted-foreground",
  },
};

type PlanHealthBadgeProps = {
  status: PlanHealthStatus;
  className?: string;
};

export function PlanHealthBadge({ status, className }: PlanHealthBadgeProps) {
  const config = HEALTH_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
