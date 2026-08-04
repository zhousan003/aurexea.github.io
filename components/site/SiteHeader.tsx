import Link from "next/link";
import { Brand } from "@/components/site/Brand";
import { AnalyticsTracker } from "@/components/site/AnalyticsTracker";
import { DonationModal } from "@/components/site/DonationModal";
import type { Locale } from "@/lib/site-data";
import { getDonationSetting } from "@/lib/db-data";

const nav = {
  zh: [
    ["首页", "/zh"],
    ["MT4EA", "/zh/mt4ea"],
    ["MT5EA", "/zh/mt5ea"],
    ["热门 EA", "/zh/popular"],
    ["留言板", "/zh/messages"],
  ],
  en: [
    ["Home", "/en"],
    ["MT4 EA", "/en/mt4ea"],
    ["MT5 EA", "/en/mt5ea"],
    ["Popular EA", "/en/popular"],
    ["Messages", "/en/messages"],
  ],
} satisfies Record<Locale, Array<[string, string]>>;

export async function SiteHeader({ locale }: { locale: Locale }) {
  const otherLocaleHref = locale === "zh" ? "/en" : "/zh";
  const otherLocaleLabel = locale === "zh" ? "English" : "中文";
  const donationSetting = await getDonationSetting();

  return (
    <>
      <AnalyticsTracker locale={locale} />
      <div className="top-strip">
        <span>
          {locale === "zh"
            ? "每周更新免费 EA、SetFiles、指标和量化交易工具"
            : "Weekly updates for free EAs, SetFiles, indicators and quant tools"}
        </span>
        <Link href={locale === "zh" ? "/zh/popular" : "/en/popular"}>
          {locale === "zh" ? "查看热门 EA" : "View popular EAs"}
        </Link>
      </div>
      <header className="site-header">
        <Brand href={`/${locale}`} label={locale === "zh" ? "曜汇EA首页" : "AurexEA home"} />
        <nav className="main-nav" aria-label={locale === "zh" ? "前台导航" : "Primary navigation"}>
          {nav[locale].map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="icon-button language-link" href={otherLocaleHref}>
            {otherLocaleLabel}
          </Link>
          <DonationModal locale={locale} setting={donationSetting} />
        </div>
      </header>
    </>
  );
}
