import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "zh",
  "热门 EA 推荐 - 曜汇EA",
  "查看曜汇EA推荐的热门免费 MT4/MT5 EA。",
  "/zh/popular",
);

export default async function ZhPopularPage() {
  const products = await getProducts({ locale: "zh", popularOnly: true });

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="zh" kind="popular" products={products} />
        </section>
      </main>
    </>
  );
}
