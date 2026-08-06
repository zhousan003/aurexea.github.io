import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site-data";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: "AurexEA",
  description: "Free MT4/MT5 Expert Advisors and quant trading tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2360255171901038"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
