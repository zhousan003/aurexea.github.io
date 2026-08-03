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
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ locale: "zh" });
  const generatedAt = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/zh"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1,
      alternates: languageAlternates("/zh", "/en"),
    },
    {
      url: absoluteUrl("/en"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1,
      alternates: languageAlternates("/zh", "/en"),
    },
    {
      url: absoluteUrl("/zh/mt4ea"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt4ea", "/en/mt4ea"),
    },
    {
      url: absoluteUrl("/en/mt4ea"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt4ea", "/en/mt4ea"),
    },
    {
      url: absoluteUrl("/zh/mt5ea"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt5ea", "/en/mt5ea"),
    },
    {
      url: absoluteUrl("/en/mt5ea"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: languageAlternates("/zh/mt5ea", "/en/mt5ea"),
    },
    {
      url: absoluteUrl("/zh/popular"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.7,
      alternates: languageAlternates("/zh/popular", "/en/popular"),
    },
    {
      url: absoluteUrl("/en/popular"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.7,
      alternates: languageAlternates("/zh/popular", "/en/popular"),
    },
  ];

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) => {
    const lastModified = product.createdAt ? new Date(product.createdAt) : generatedAt;
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
