"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteAllPlans,
  deleteAllTransactions,
} from "@/app/(app)/settings/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DangerAction = "transactions" | "plans" | null;

export function SettingsDangerZone() {
  const router = useRouter();
  const [openAction, setOpenAction] = useState<DangerAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!openAction) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const result =
        openAction === "transactions"
          ? await deleteAllTransactions()
          : await deleteAllPlans();

      if (result.error) {
        toast.error("Delete failed", { description: result.error });
        setError(result.error);
        return;
      }

      const message =
        openAction === "transactions"
          ? "All transactions deleted"
          : "All plans deleted";

      toast.success(message);
      setOpenAction(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/30 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <AlertTriangle className="size-4" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Destructive actions cannot be undone. Confirm before proceeding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <AlertDialog
          open={openAction === "transactions"}
          onOpenChange={(open) => setOpenAction(open ? "transactions" : null)}
        >
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
              />
            }
          >
            Delete all transactions
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all transactions?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes every contribution, withdrawal, and
                adjustment. Your plans will remain, but saved balances will reset
                to zero.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={handleConfirm}
              >
                {isDeleting ? "Deleting…" : "Delete transactions"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={openAction === "plans"}
          onOpenChange={(open) => setOpenAction(open ? "plans" : null)}
        >
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="destructive"
                className="w-full min-h-11"
              />
            }
          >
            Delete all plans
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all plans?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes every savings plan and all linked
                transactions. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={handleConfirm}
              >
                {isDeleting ? "Deleting…" : "Delete all plans"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
