"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          description="An unexpected error occurred. Try again or return to the dashboard."
          onRetry={reset}
        />
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "touch" }),
            "mt-4 w-full justify-center",
          )}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
