import Link from "next/link";
import { Plus, Target, Wallet } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Log contribution",
    href: "/transactions/new",
    icon: Wallet,
    variant: "default" as const,
  },
  {
    label: "New plan",
    href: "/plans/new",
    icon: Plus,
    variant: "outline" as const,
  },
  {
    label: "View plans",
    href: "/plans",
    icon: Target,
    variant: "outline" as const,
  },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              buttonVariants({ variant: action.variant }),
              "h-auto justify-center gap-2 py-3",
            )}
          >
            <Icon className="size-4" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
