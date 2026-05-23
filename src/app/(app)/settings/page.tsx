import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { SettingsDataManagement } from "@/components/settings/settings-data-management";
import { SettingsLogoutButton } from "@/components/settings/settings-logout-button";
import { SettingsProfileForm } from "@/components/settings/settings-profile-form";
import { getSettingsData } from "@/lib/settings/get-settings-data";

export default async function SettingsPage() {
  const data = await getSettingsData();

  if (!data) {
    redirect("/auth/login");
  }

  return (
    <AppShell title="Settings">
      <div className="page-content">
        <SettingsProfileForm profile={data.profile} />
        <SettingsDataManagement />
        <SettingsLogoutButton />
        <SettingsDangerZone />
      </div>
    </AppShell>
  );
}
