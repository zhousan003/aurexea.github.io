import type { Metadata } from "next";
import { CategoryPage } from "@/components/site/CategoryPage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProducts } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "Free MT4 EAs - AurexEA",
  description: "Download free Expert Advisors, SetFiles and tools for MetaTrader 4.",
};

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
