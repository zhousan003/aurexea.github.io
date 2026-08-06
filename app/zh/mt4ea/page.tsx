import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "zh",
  "MT4EA 免费下载 - 曜汇EA",
  "免费下载适用于 MetaTrader 4 的 EA、SetFiles 和自动交易工具。",
  "/zh/mt4ea",
);

export default async function ZhMt4EaPage() {
  const products = await getProducts({ locale: "zh", platform: "mt4" });

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="zh" kind="mt4" products={products} />
        </section>
      </main>
    </>
  );
}
