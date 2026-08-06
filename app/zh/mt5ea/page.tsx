import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "zh",
  "MT5EA 免费下载 - 曜汇EA",
  "免费下载适用于 MetaTrader 5 的黄金 EA、趋势 EA 和量化交易工具。",
  "/zh/mt5ea",
);

export default async function ZhMt5EaPage() {
  const products = await getProducts({ locale: "zh", platform: "mt5" });

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="zh" kind="mt5" products={products} />
        </section>
      </main>
    </>
  );
}
