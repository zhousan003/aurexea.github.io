import { CategoryAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories } from "@/lib/admin-data";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoryAdminPage categories={categories} />;
}
