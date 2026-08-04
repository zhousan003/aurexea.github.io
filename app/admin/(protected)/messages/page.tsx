import { GuestMessageAdminPage } from "@/components/admin/AdminMessages";
import { getAdminGuestMessages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getAdminGuestMessages();
  return <GuestMessageAdminPage messages={messages} />;
}
