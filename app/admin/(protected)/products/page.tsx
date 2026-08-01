import { ProductAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-data";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return <ProductAdminPage products={products} categories={categories} savedSlug={params?.saved ? params.slug || "success" : null} />;
}
