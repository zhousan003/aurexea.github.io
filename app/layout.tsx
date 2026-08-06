import type { Metadata } from "next";
import "./globals.css";
import { getGlobalAdSenseClientId } from "@/lib/db-data";
import { site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "免费 MT4/MT5 EA 下载 - 曜汇EA",
    template: "%s | 曜汇EA",
  },
  description: "曜汇EA整理免费的 MT4/MT5 Expert Advisors、SetFiles、指标和量化交易工具，提供产品说明、安装步骤和风险提示。",
  applicationName: "AurexEA",
  authors: [{ name: "AurexEA" }],
  creator: "AurexEA",
  publisher: "AurexEA",
  keywords: ["免费 EA", "MT4 EA", "MT5 EA", "黄金 EA", "XAUUSD", "量化交易", "Expert Advisor"],
  openGraph: {
    title: "免费 MT4/MT5 EA 下载 - 曜汇EA",
    description: "免费获取 MT4/MT5 EA、SetFiles、指标和量化交易工具。",
    url: site.siteUrl,
    siteName: "AurexEA 曜汇EA",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "免费 MT4/MT5 EA 下载 - 曜汇EA",
    description: "免费获取 MT4/MT5 EA、SetFiles、指标和量化交易工具。",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const adSenseClientId = await getGlobalAdSenseClientId();

  return (
    <html lang="zh-CN">
      <head>
        {adSenseClientId ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
