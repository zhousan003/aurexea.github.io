import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "热门 EA 推荐 - 曜汇EA",
  description: "查看曜汇EA推荐的热门免费 MT4/MT5 EA。",
};

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
