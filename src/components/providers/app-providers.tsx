"use client";

import { Toaster } from "@/components/ui/sonner";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        closeButton
        offset={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      />
    </>
  );
}
