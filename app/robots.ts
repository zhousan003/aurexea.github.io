import type { MetadataRoute } from "next";
import { site } from "@/lib/site-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/zh/download/", "/en/download/"],
    },
    sitemap: `${site.siteUrl}/sitemap.xml`,
    host: site.siteUrl,
  };
}
