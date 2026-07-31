import { notFound } from "next/navigation";
import { DownloadWait } from "@/components/download/DownloadWait";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getDownloadAdSlot, getProductBySlug } from "@/lib/db-data";

export default async function EnDownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, adSlot] = await Promise.all([getProductBySlug(slug), getDownloadAdSlot()]);
  if (!product) notFound();

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="view is-visible">
          <DownloadWait locale="en" product={product} adSlot={adSlot} />
        </section>
      </main>
    </>
  );
}
