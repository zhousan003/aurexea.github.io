import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DownloadWait } from "@/components/download/DownloadWait";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDownloadAdSlot, getProductBySlug } from "@/lib/db-data";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ZhDownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, adSlot] = await Promise.all([getProductBySlug(slug), getDownloadAdSlot()]);
  if (!product) notFound();

  return (
    <>
      <SiteHeader locale="zh" />
      <main>
        <section className="view is-visible">
          <DownloadWait locale="zh" product={product} adSlot={adSlot} />
        </section>
      </main>
    </>
  );
}
