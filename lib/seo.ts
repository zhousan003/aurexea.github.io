import type { Metadata } from "next";
import { site } from "@/lib/site-data";

export function createMetadata(
  locale: "zh" | "en",
  title: string,
  description: string,
  pathname = `/${locale}`,
  image?: string,
): Metadata {
  const canonical = new URL(pathname, site.siteUrl).toString();
  const alternatePathname = pathname.replace(locale === "zh" ? /^\/zh/ : /^\/en/, locale === "zh" ? "/en" : "/zh");
  const imageUrl = image ? new URL(image, site.siteUrl).toString() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-CN": locale === "zh" ? canonical : new URL(alternatePathname, site.siteUrl).toString(),
        en: locale === "en" ? canonical : new URL(alternatePathname, site.siteUrl).toString(),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: `${site.name} ${site.brandZh}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
