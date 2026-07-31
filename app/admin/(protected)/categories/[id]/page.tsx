import { notFound } from "next/navigation";
import { CategoryAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories, getAdminCategoryById } from "@/lib/admin-data";

export default async function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, editingCategory] = await Promise.all([
    getAdminCategories(),
    getAdminCategoryById(id),
  ]);

  if (!editingCategory) {
    notFound();
  }

  return <CategoryAdminPage categories={categories} editingCategory={editingCategory} />;
}
