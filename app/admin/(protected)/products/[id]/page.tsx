import { notFound } from "next/navigation";
import { ProductAdminPage } from "@/components/admin/AdminForms";
import { getAdminCategories, getAdminProductById, getAdminProducts } from "@/lib/admin-data";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, categories, editingProduct] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminProductById(id),
  ]);

  if (!editingProduct) {
    notFound();
  }

  return <ProductAdminPage products={products} categories={categories} editingProduct={editingProduct} />;
}
