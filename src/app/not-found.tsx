import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 safe-top safe-bottom">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ size: "touch" }),
            "mt-6 w-full justify-center",
          )}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
