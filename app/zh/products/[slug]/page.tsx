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
    "zh",
    product ? `${product.titleZh} - 免费黄金 EA` : "免费黄金 EA 下载 - 曜汇EA",
    product?.descriptionZh || product?.excerptZh || "免费 MT5 黄金 EA、SetFiles 和量化交易工具。",
    `/zh/products/${slug}`,
    product?.thumbnailUrl,
  );
}

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
