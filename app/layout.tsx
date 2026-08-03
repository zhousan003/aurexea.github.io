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
      <body>{children}</body>
    </html>
  );
}
