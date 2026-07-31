import { ProductAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-data";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return <ProductAdminPage products={products} categories={categories} />;
}
