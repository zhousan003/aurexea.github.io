import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminAnalyticsPage() {
  const data = await getAdminDashboardData();
  return <AdminDashboard data={data} />;
}
