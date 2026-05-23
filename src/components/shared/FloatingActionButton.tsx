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
    "fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg shadow-primary/25",
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
