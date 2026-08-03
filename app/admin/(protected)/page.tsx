import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();
  return <AdminDashboard data={data} />;
}
