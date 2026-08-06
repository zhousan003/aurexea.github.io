import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata(
  "en",
  "Free MT5 EAs - AurexEA",
  "Download free Expert Advisors and quant trading tools for MetaTrader 5.",
  "/en/mt5ea",
);

export default async function EnMt5EaPage() {
  const products = await getProducts({ locale: "en", platform: "mt5" });

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <CategoryPage locale="en" kind="mt5" products={products} />
        </section>
      </main>
    </>
  );
}
