import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function FloatingActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  className,
}: FloatingActionButtonProps) {
  const fabClassName = cn(
    buttonVariants({ size: "icon" }),
    "fixed app-fab-bottom right-3 z-40 size-14 rounded-full shadow-lg shadow-primary/25 sm:right-4",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={fabClassName} aria-label={label}>
        <Icon className="size-6" />
      </Link>
    );
  }

  return (
    <Button
      size="icon"
      className={fabClassName}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-6" />
    </Button>
  );
}
