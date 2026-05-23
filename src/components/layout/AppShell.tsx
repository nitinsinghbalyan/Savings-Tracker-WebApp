import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightSlot?: React.ReactNode;
  hideNav?: boolean;
  className?: string;
};

export function AppShell({
  children,
  title,
  showBack,
  backHref,
  rightSlot,
  hideNav = false,
  className,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <MobileHeader
        title={title}
        showBack={showBack}
        backHref={backHref}
        rightSlot={rightSlot}
      />

      <main
        className={cn(
          "mx-auto w-full max-w-lg flex-1 px-3 py-4 sm:px-4",
          !hideNav && "app-main-padding",
          className,
        )}
      >
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
