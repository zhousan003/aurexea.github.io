import type { Metadata } from "next";
import { HomePage } from "@/components/site/HomePage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories, getPlatformCounts, getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

const title = "免费 MT4/MT5 EA 下载 · 曜汇EA (AurexEA)";
const homeMetadata = createMetadata(
  "zh",
  title,
  "曜汇EA提供免费的 MT4/MT5 EA、SetFiles、指标和量化交易工具下载。",
  "/zh",
);

export const metadata: Metadata = { ...homeMetadata, title: { absolute: title } };

export default async function ZhHomePage() {
  const [products, categories, platformCounts] = await Promise.all([
    getProducts({ locale: "zh", limit: 8 }),
    getCategories(),
    getPlatformCounts(),
  ]);

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <HomePage locale="zh" products={products} categories={categories} platformCounts={platformCounts} />
        </section>
      </main>
    </>
  );
}
