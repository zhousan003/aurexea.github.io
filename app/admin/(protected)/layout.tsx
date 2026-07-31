import { AdminShell } from "@/components/admin/AdminShell";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
