import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type MobileHeaderProps = {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightSlot?: React.ReactNode;
  className?: string;
};

export function MobileHeader({
  title,
  showBack = false,
  backHref = "/",
  rightSlot,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-3 sm:gap-3 sm:px-4">
        {showBack ? (
          <Link
            href={backHref}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Link>
        ) : (
          <div className="size-11 shrink-0" />
        )}

        <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>

        <div className="flex size-11 shrink-0 items-center justify-center">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
