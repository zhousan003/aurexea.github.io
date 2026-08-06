import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "en",
  "Popular EAs - AurexEA",
  "Popular free MT4/MT5 Expert Advisors curated by AurexEA.",
  "/en/popular",
);

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
