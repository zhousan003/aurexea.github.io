import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProductBySlug } from "@/lib/db-data";

export default async function ZhProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <ProductDetail locale="zh" product={product} />
        </section>
      </main>
    </>
  );
}
