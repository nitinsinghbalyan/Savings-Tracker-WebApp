"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateProfile } from "@/app/(app)/settings/actions";
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
import type { UserProfile } from "@/lib/settings/types";
import { mobileSelectClassName } from "@/lib/form-styles";

const profileSchema = z.object({
  fullName: z.string().optional(),
  monthlyIncomeRupees: z.preprocess(
    (value) =>
      typeof value === "number" && Number.isNaN(value) ? undefined : value,
    z.number().nonnegative("Monthly income cannot be negative").optional(),
  ),
  preferredSavingDay: z
    .number({ error: "Enter a day between 1 and 31" })
    .int()
    .min(1, "Day must be between 1 and 31")
    .max(31, "Day must be between 1 and 31"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type SettingsProfileFormProps = {
  profile: UserProfile;
};

const fieldSelectClassName = mobileSelectClassName;

export function SettingsProfileForm({ profile }: SettingsProfileFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    defaultValues: {
      fullName: profile.fullName,
      monthlyIncomeRupees:
        profile.monthlyIncomePaise !== null
          ? profile.monthlyIncomePaise / 100
          : undefined,
      preferredSavingDay: profile.preferredSavingDay,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitError(null);

    const monthlyIncomePaise =
      values.monthlyIncomeRupees !== undefined &&
      Number.isFinite(values.monthlyIncomeRupees)
        ? Math.round(values.monthlyIncomeRupees * 100)
        : null;

    const result = await updateProfile({
      fullName: values.fullName ?? "",
      monthlyIncomePaise,
      preferredSavingDay: values.preferredSavingDay,
    });

    if (result.error) {
      toast.error("Could not update profile", { description: result.error });
      setSubmitError(result.error);
      return;
    }

    toast.success("Profile updated");
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>
          Signed in as{" "}
          <span className="font-medium text-foreground">{profile.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="Your name"
              {...register("fullName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncomeRupees">Monthly income (₹)</Label>
            <Input
              id="monthlyIncomeRupees"
              type="number"
              min="0"
              step="100"
              placeholder="Optional"
              {...register("monthlyIncomeRupees", { valueAsNumber: true })}
            />
            {errors.monthlyIncomeRupees && (
              <p className="text-sm text-destructive">
                {errors.monthlyIncomeRupees.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredSavingDay">Preferred saving day</Label>
            <select
              id="preferredSavingDay"
              className={fieldSelectClassName}
              {...register("preferredSavingDay", { valueAsNumber: true })}
            >
              {Array.from({ length: 31 }, (_, index) => index + 1).map(
                (day) => (
                  <option key={day} value={day}>
                    Day {day} of each month
                  </option>
                ),
              )}
            </select>
            {errors.preferredSavingDay && (
              <p className="text-sm text-destructive">
                {errors.preferredSavingDay.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value="INR" disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Currency is fixed to Indian Rupees (INR).
            </p>
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button type="submit" size="touch" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
