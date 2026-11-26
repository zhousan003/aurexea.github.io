import type { Metadata } from "next";
import type { Locale, ProductCard } from "@/lib/site-data";
import { getLocalizedTitle, site } from "@/lib/site-data";

export function createMetadata(
  locale: "zh" | "en",
  title: string,
  description: string,
  pathname = `/${locale}`,
  image?: string,
  isProduct = false,
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
        "x-default": new URL(locale === "zh" ? pathname : alternatePathname, site.siteUrl).toString(),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: `${site.name} ${site.brandZh}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(isProduct ? {} : { type: "website" }),
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

export function createProductMetadata(locale: Locale, slug: string, product: ProductCard): Metadata {
  const zh = locale === "zh";
  const title = getLocalizedTitle(locale, product);
  const platform = product.platform === "BOTH" ? "MT4/MT5" : product.platform;
  const symbol = product.symbol === "-" ? "" : product.symbol;
  const summary = (zh ? product.seoDescZh : product.seoDescEn)?.replace(/\s+/g, " ").trim();
  const description = summary || (zh
    ? `${title} 的交易平台为 ${platform}${symbol ? `，适用品种为 ${symbol}` : ""}。查看产品说明和下载信息。`
    : `Explore ${title} for ${platform}${symbol ? `, with support for ${symbol}` : ""}. View product details and download information.`);

  return createMetadata(
    locale,
    (zh ? product.seoTitleZh : product.seoTitleEn)?.trim() || `${title} · ${platform}`,
    description,
    `/${locale}/products/${slug}`,
    product.thumbnailUrl,
    true,
  );
}
