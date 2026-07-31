import { AdsAdminPage } from "@/components/admin/AdminForms";
import { getAdminAdSlot } from "@/lib/admin-data";

export default async function AdminAdsPage() {
  const adSlot = await getAdminAdSlot();
  return <AdsAdminPage adSlot={adSlot} />;
}
