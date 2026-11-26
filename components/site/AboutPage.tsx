import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { Locale } from "@/lib/site-data";

const content = {
  zh: {
    title: "关于曜汇EA",
    description: "曜汇EA（AurexEA）为 MetaTrader 用户整理免费 MT4/MT5 EA、SetFiles、指标和量化交易工具，方便用户在模拟账户中了解和测试自动化策略。",
    testing: "如何阅读测试报告",
    testingText: "查看产品附带的报告时，请核对交易品种、周期、测试区间、点差和最大回撤。比较结果时应使用相近的测试条件。报告缺少关键信息时，可先用自己的经纪商数据重新测试。",
    risk: "交易风险",
    riskText: "历史表现不代表未来结果。EA 在实盘中的表现会受点差、滑点、执行速度和参数影响。使用前请在模拟账户验证，并自行评估杠杆和回撤风险。",
    contact: "提交产品问题或反馈",
  },
  en: {
    title: "About AurexEA",
    description: "AurexEA curates free MT4 and MT5 Expert Advisors, SetFiles, indicators, and quantitative trading tools so MetaTrader users can explore and test automated strategies on demo accounts.",
    testing: "How to read test reports",
    testingText: "When a product includes a report, check its trading symbol, timeframe, test period, spread, and maximum drawdown. Compare results under similar conditions. If key details are missing, run a fresh test using your broker’s data.",
    risk: "Trading risk",
    riskText: "Past performance does not guarantee future results. Spreads, slippage, execution speed, and settings can affect live EA performance. Test on a demo account and assess leverage and drawdown risk before using an EA.",
    contact: "Ask a question or leave feedback",
  },
};

export function getAboutCopy(locale: Locale) {
  return content[locale];
}

export function AboutPage({ locale }: { locale: Locale }) {
  const copy = getAboutCopy(locale);

  return (
    <>
      <SiteHeader locale={locale} alternatePath="/about" />
      <main className="view is-visible">
        <div className="content-tabs">
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <section className="content-tabs">
          <h2>{copy.testing}</h2>
          <p>{copy.testingText}</p>
        </section>
        <section className="content-tabs">
          <h2>{copy.risk}</h2>
          <p>{copy.riskText}</p>
          <Link className="text-button" href={`/${locale}/messages`}>{copy.contact}</Link>
        </section>
      </main>
    </>
  );
}
