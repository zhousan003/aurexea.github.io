import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProductBySlug } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return createMetadata(
    "en",
    product ? `${product.titleEn} - Free EA Download` : "Free MT4/MT5 EA Download - AurexEA",
    product?.descriptionEn || product?.excerptEn || "Free MT4/MT5 Expert Advisors, SetFiles and quant trading tools.",
    `/en/products/${slug}`,
    product?.thumbnailUrl,
  );
}

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
