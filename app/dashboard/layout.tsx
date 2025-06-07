import { DashboardLayout } from "@/components/dashboard/layout";
import { dashboardNav } from "@/config/dashboard-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout sections={dashboardNav}>{children}</DashboardLayout>;
}
