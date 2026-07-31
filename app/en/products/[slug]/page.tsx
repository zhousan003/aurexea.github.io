import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProductBySlug } from "@/lib/db-data";

export default async function EnProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <ProductDetail locale="en" product={product} />
        </section>
      </main>
    </>
  );
}
