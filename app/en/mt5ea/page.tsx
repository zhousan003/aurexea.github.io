import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "Free MT5 EAs - AurexEA",
  description: "Download free Expert Advisors and quant trading tools for MetaTrader 5.",
};

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
