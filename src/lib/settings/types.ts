export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  monthlyIncomePaise: number | null;
  preferredSavingDay: number;
  currency: string;
};

export type SettingsData = {
  profile: UserProfile;
};
