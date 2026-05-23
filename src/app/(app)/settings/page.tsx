"use client";

import { ChevronRight, IndianRupee, LogOut, User } from "lucide-react";

import { logout } from "@/app/(app)/settings/actions";
import { AppShell } from "@/components/layout/AppShell";
import { Separator } from "@/components/ui/separator";

const settingsItems = [
  {
    id: "profile",
    icon: User,
    label: "Profile",
    description: "Name, email, and account details",
    locked: false,
  },
  {
    id: "currency",
    icon: IndianRupee,
    label: "Currency",
    description: "INR (locked)",
    locked: true,
  },
] as const;

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="rounded-xl border border-border bg-card">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
                onClick={() => console.log(`${item.label} coming soon`)}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {!item.locked && (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </button>
              {index < settingsItems.length - 1 && <Separator />}
            </div>
          );
        })}

        <Separator />

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <LogOut className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}

