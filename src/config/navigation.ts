import {
  BarChart3,
  LayoutDashboard,
  Plus,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export type BottomNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
};

export const bottomNavItems: BottomNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: Target },
  { label: "Add", href: "/transactions/new", icon: Plus, accent: true },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];
