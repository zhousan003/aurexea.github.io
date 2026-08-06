import type { Metadata } from "next";
import { HomePage } from "@/components/site/HomePage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories, getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "en",
  "Free MT4/MT5 Expert Advisors - AurexEA",
  "Download free MT4/MT5 Expert Advisors, SetFiles and trading tools.",
  "/en",
);

export default async function EnHomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ locale: "en", limit: 8 }),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <HomePage locale="en" products={products} categories={categories} />
        </section>
      </main>
    </>
  );
}
