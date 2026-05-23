import { cn } from "@/lib/utils";

export const mobileSelectClassName = cn(
  "min-h-11 h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "md:min-h-8 md:h-8 md:px-2.5 md:py-1 md:text-sm dark:bg-input/30",
);

export const mobileTextareaClassName = cn(
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-base transition-colors outline-none",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "md:min-h-20 md:px-2.5 md:py-2 md:text-sm dark:bg-input/30",
);
