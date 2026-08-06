import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "en",
  "Free MT4 EAs - AurexEA",
  "Download free Expert Advisors, SetFiles and tools for MetaTrader 4.",
  "/en/mt4ea",
);

export default async function EnMt4EaPage() {
  const products = await getProducts({ locale: "en", platform: "mt4" });

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="en" kind="mt4" products={products} />
        </section>
      </main>
    </>
  );
}
