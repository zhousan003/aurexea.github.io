import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProductBySlug } from "@/lib/db-data";
import { createProductMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return createProductMetadata("en", slug, product);
}

export default async function EnProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader locale="en" alternatePath={`/products/${slug}`} />
      <main>
        <section className="view is-visible">
          <ProductDetail locale="en" product={product} />
        </section>
      </main>
    </>
  );
}
