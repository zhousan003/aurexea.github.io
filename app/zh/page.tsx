import type { Metadata } from "next";
import { HomePage } from "@/components/site/HomePage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories, getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "zh",
  "免费 MT4/MT5 EA 下载 - 曜汇EA",
  "曜汇EA提供免费的 MT4/MT5 EA、SetFiles、指标和量化交易工具下载。",
  "/zh",
);

export default async function ZhHomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ locale: "zh", limit: 8 }),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <HomePage locale="zh" products={products} categories={categories} />
        </section>
      </main>
    </>
  );
}
