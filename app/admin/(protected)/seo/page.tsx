import { SeoAdminPage } from "@/components/admin/AdminForms";
import { getAdminSeoSettings } from "@/lib/admin-data";

export default async function AdminSeoPage() {
  const settings = await getAdminSeoSettings();
  return <SeoAdminPage settings={settings} />;
}
