import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db-data";
import { site } from "@/lib/site-data";

export const runtime = "nodejs";
export const revalidate = 3600;

function absoluteUrl(pathname: string) {
  return new URL(pathname, site.siteUrl).toString();
}

function languageAlternates(zhPath: string, enPath: string) {
  return {
    languages: {
      "zh-CN": absoluteUrl(zhPath),
      en: absoluteUrl(enPath),
      "x-default": absoluteUrl(zhPath),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ locale: "zh" });
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/zh"),
      changeFrequency: "daily",
      priority: 1,
      alternates: languageAlternates("/zh", "/en"),
    },
    {
      url: absoluteUrl("/en"),
      changeFrequency: "daily",
      priority: 1,
      alternates: languageAlternates("/zh", "/en"),
    },
    {
      url: absoluteUrl("/zh/mt4ea"),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt4ea", "/en/mt4ea"),
    },
    {
      url: absoluteUrl("/en/mt4ea"),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt4ea", "/en/mt4ea"),
    },
    {
      url: absoluteUrl("/zh/mt5ea"),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt5ea", "/en/mt5ea"),
    },
    {
      url: absoluteUrl("/en/mt5ea"),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt5ea", "/en/mt5ea"),
    },
    {
      url: absoluteUrl("/zh/popular"),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: languageAlternates("/zh/popular", "/en/popular"),
    },
    {
      url: absoluteUrl("/en/popular"),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: languageAlternates("/zh/popular", "/en/popular"),
    },
    ...(["zh", "en"] as const).map((locale) => ({
      url: absoluteUrl(`/${locale}/about`),
      changeFrequency: "yearly" as const,
      alternates: languageAlternates("/zh/about", "/en/about"),
    })),
    {
      url: absoluteUrl("/zh/privacy"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) => {
    const publishedAt = product.publishedAt || product.createdAt;
    const lastModified = publishedAt ? new Date(publishedAt) : undefined;
    const alternates = languageAlternates(`/zh/products/${product.slug}`, `/en/products/${product.slug}`);

    return [
      {
        url: absoluteUrl(`/zh/products/${product.slug}`),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates,
      },
      {
        url: absoluteUrl(`/en/products/${product.slug}`),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates,
      },
    ];
  });

  return [...staticEntries, ...productEntries];
}
