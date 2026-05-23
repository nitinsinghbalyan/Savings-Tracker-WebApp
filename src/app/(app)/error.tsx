"use client";

import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/shared/ErrorState";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell title="Something went wrong">
      <ErrorState
        title="Unable to load this page"
        description="An unexpected error occurred. Try again or return later."
        onRetry={reset}
      />
    </AppShell>
  );
}
