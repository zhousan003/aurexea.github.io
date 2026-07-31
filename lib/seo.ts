import { site } from "@/lib/site-data";

export function createMetadata(locale: "zh" | "en", title: string, description: string) {
  return {
    title,
    description,
    alternates: {
      canonical: `${site.siteUrl}/${locale}`,
      languages: {
        "zh-CN": `${site.siteUrl}/zh`,
        en: `${site.siteUrl}/en`,
      },
    },
  };
}
