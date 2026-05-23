import Link from "next/link";
import { Minus, Pencil, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanDetailActionsProps = {
  planId: string;
};

export function PlanDetailActions({ planId }: PlanDetailActionsProps) {
  const contributionHref = `/transactions/new?planId=${planId}&type=CONTRIBUTION`;
  const withdrawalHref = `/transactions/new?planId=${planId}&type=WITHDRAWAL`;
  const editHref = `/plans/${planId}/edit`;

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={contributionHref}
        className={cn(buttonVariants(), "w-full justify-center gap-2")}
      >
        <Plus className="size-4" />
        Add contribution
      </Link>
      <Link
        href={withdrawalHref}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-center gap-2",
        )}
      >
        <Minus className="size-4" />
        Withdraw
      </Link>
      <Link
        href={editHref}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-center gap-2",
        )}
      >
        <Pencil className="size-4" />
        Edit plan
      </Link>
    </div>
  );
}
