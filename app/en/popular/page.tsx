import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "Popular EAs - AurexEA",
  description: "Popular free MT4/MT5 Expert Advisors curated by AurexEA.",
};

export default async function EnPopularPage() {
  const products = await getProducts({ locale: "en", popularOnly: true });

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="en" kind="popular" products={products} />
        </section>
      </main>
    </>
  );
}
