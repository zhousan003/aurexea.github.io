import { CategoryAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories } from "@/lib/admin-data";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; slug?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const categories = await getAdminCategories();
  return (
    <CategoryAdminPage
      categories={categories}
      savedSlug={params?.saved ? params.slug || "success" : null}
      deleted={params?.deleted === "1"}
    />
  );
}
