import { LogOut } from "lucide-react";

import { logout } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsLogoutButton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Account</CardTitle>
        <CardDescription>Sign out of SavingIt on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
