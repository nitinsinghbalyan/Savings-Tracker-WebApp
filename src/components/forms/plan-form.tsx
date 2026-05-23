"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createPlan } from "@/app/(app)/plans/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_PLAN_CATEGORY,
  DEFAULT_PLAN_PRIORITY,
  PLAN_CATEGORIES,
  PLAN_COLOR_PRESETS,
  PLAN_PRIORITIES,
} from "@/config/plan-options";
import { cn } from "@/lib/utils";

const planSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required"),
  description: z.string().optional(),
  category: z.enum(PLAN_CATEGORIES),
  targetAmountRupees: z
    .number({ error: "Enter a valid target amount" })
    .positive("Target amount must be greater than zero"),
  targetDate: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) {
          return true;
        }
        const parsed = Date.parse(value);
        return !Number.isNaN(parsed);
      },
      { message: "Enter a valid target date" },
    ),
  priority: z.enum(PLAN_PRIORITIES),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type PlanFormValues = z.infer<typeof planSchema>;

type PlanFormProps = {
  defaultValues?: Partial<PlanFormValues>;
  submitLabel?: string;
};

const fieldSelectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "md:text-sm dark:bg-input/30",
);

const fieldTextareaClassName = cn(
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "md:text-sm dark:bg-input/30",
);

export function PlanForm({
  defaultValues,
  submitLabel = "Create plan",
}: PlanFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      category: DEFAULT_PLAN_CATEGORY,
      targetAmountRupees: undefined,
      targetDate: "",
      priority: DEFAULT_PLAN_PRIORITY,
      icon: "",
      color: "",
      ...defaultValues,
    },
  });

  const selectedColor = watch("color");

  async function onSubmit(values: PlanFormValues) {
    setSubmitError(null);

    const targetAmountPaise = Math.round(values.targetAmountRupees * 100);

    const result = await createPlan({
      name: values.name.trim(),
      description: values.description?.trim(),
      category: values.category,
      targetAmountPaise,
      targetDate: values.targetDate || undefined,
      priority: values.priority,
      icon: values.icon?.trim(),
      color: values.color?.trim(),
    });

    if (result?.error) {
      setSubmitError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Savings plan</CardTitle>
        <CardDescription>
          Set a goal and track your progress in INR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Plan name</Label>
            <Input
              id="name"
              placeholder="Emergency fund"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              placeholder="What are you saving for?"
              className={fieldTextareaClassName}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" className={fieldSelectClassName} {...register("category")}>
              {PLAN_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmountRupees">Target amount (₹)</Label>
            <Input
              id="targetAmountRupees"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="50000"
              {...register("targetAmountRupees", { valueAsNumber: true })}
            />
            {errors.targetAmountRupees && (
              <p className="text-sm text-destructive">
                {errors.targetAmountRupees.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target date (optional)</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
            {errors.targetDate && (
              <p className="text-sm text-destructive">
                {errors.targetDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select id="priority" className={fieldSelectClassName} {...register("priority")}>
              {PLAN_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              placeholder="e.g. piggy-bank"
              autoComplete="off"
              {...register("icon")}
            />
            <p className="text-xs text-muted-foreground">
              Lucide icon name for future display.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color (optional)</Label>
            <Input
              id="color"
              placeholder="#10B981"
              autoComplete="off"
              {...register("color")}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {PLAN_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  aria-label={`Use ${preset.label} color`}
                  className={cn(
                    "size-8 rounded-full border-2 transition-transform hover:scale-105",
                    selectedColor === preset.value
                      ? "border-primary"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: preset.value }}
                  onClick={() =>
                    setValue("color", preset.value, { shouldDirty: true })
                  }
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
