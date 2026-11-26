import type { Metadata } from "next";
import { HomePage } from "@/components/site/HomePage";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories, getPlatformCounts, getProducts } from "@/lib/db-data";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

const title = "Free MT4/MT5 Expert Advisor Downloads · AurexEA";
const homeMetadata = createMetadata(
  "en",
  title,
  "Download free MT4/MT5 Expert Advisors, SetFiles and trading tools.",
  "/en",
);

export const metadata: Metadata = { ...homeMetadata, title: { absolute: title } };

export default async function EnHomePage() {
  const [products, categories, platformCounts] = await Promise.all([
    getProducts({ locale: "en", limit: 8 }),
    getCategories(),
    getPlatformCounts(),
  ]);

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <HomePage locale="en" products={products} categories={categories} platformCounts={platformCounts} />
        </section>
      </main>
    </>
  );
}
