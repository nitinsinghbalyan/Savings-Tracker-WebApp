"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { bottomNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 safe-bottom"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1 sm:px-2">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/transactions/new" &&
              pathname.startsWith(item.href));

          const Icon = item.icon;

          if (item.accent) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 px-1"
              >
                <span className="flex size-12 -translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <Icon className="size-6" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
