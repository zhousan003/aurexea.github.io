import { DonationAdminPage } from "@/components/admin/AdminForms";
import { getAdminDonationSetting } from "@/lib/admin-data";

export default async function AdminDonationsPage() {
  const setting = await getAdminDonationSetting();
  return <DonationAdminPage setting={setting} />;
}
