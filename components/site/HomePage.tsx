import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/lib/site-data";
import type { ProductCard as ProductCardType } from "@/lib/site-data";
import type { PublicCategory } from "@/lib/db-data";

export function HomePage({
  locale,
  products,
  categories,
}: {
  locale: Locale;
  products: ProductCardType[];
  categories: PublicCategory[];
}) {
  const zh = locale === "zh";
  const featured = products[0];

  return (
    <>
      <div className="store-hero">
        <div className="hero-panel">
          <p className="eyebrow">{zh ? "免费智能交易工具" : "Free smart trading tools"}</p>
          <h1>{zh ? "最新免费 EA" : "Latest Free EAs"}</h1>
          <p>
            {zh
              ? "按平台、交易品种、时间周期和策略类型整理 EA 资源。首页直接展示最新产品，用户可以快速筛选并进入详情下载。"
              : "Browse MT4/MT5 EAs by platform, symbol, timeframe and strategy. The homepage highlights the newest products first."}
          </p>
        </div>
        <div className="hero-feature">
          <span className="sale-badge">{zh ? "最新发布" : "New Release"}</span>
          <h2>{featured ? (zh ? featured.titleZh : featured.titleEn) : zh ? "黄金量化剥头皮 EA MT5" : "Gold Quant Scalper MT5"}</h2>
          <p>
            {featured ? (zh ? featured.excerptZh : featured.excerptEn) : zh
              ? "适用于 XAUUSD 的短线量化模型，包含 EA 文件、SetFiles 和安装说明。"
              : "An XAUUSD short-term quant model with EA files, SetFiles and setup notes."}
          </p>
          <Link className="primary-button" href={`/${locale}/products/${featured?.slug || "gold-quant-scalper-mt5"}`}>
            {zh ? "查看详情" : "View Details"}
          </Link>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="search-box">
            <input
              type="search"
              placeholder={zh ? "搜索 EA、品种或策略" : "Search EA, symbol or strategy"}
              aria-label={zh ? "搜索产品" : "Search products"}
            />
            <button type="button">{zh ? "搜索" : "Search"}</button>
          </div>
          <section className="side-section">
            <h2>{zh ? "热门分类" : "Popular Categories"}</h2>
            <Link href={`/${locale}/mt4ea`}>MT4EA <span>{products.filter((product) => product.platform === "MT4" || product.platform === "BOTH").length}</span></Link>
            <Link href={`/${locale}/mt5ea`}>MT5EA <span>{products.filter((product) => product.platform === "MT5" || product.platform === "BOTH").length}</span></Link>
            {categories.slice(0, 2).map((category) => (
              <Link key={category.id} href={`/${locale}/popular`}>
                {zh ? category.nameZh : category.nameEn} <span>{category.productCount}</span>
              </Link>
            ))}
          </section>
          <section className="risk-note">
            <strong>{zh ? "风险提示" : "Risk Notice"}</strong>
            <p>
              {zh
                ? "EA 仅为自动化交易工具，历史表现不代表未来结果。实盘前请先在模拟账户测试参数、点差和滑点。"
                : "EAs are automation tools. Past performance does not guarantee future results. Test on demo first."}
            </p>
          </section>
        </aside>

        <section className="shop-main">
          <div className="section-bar">
            <div>
              <p className="eyebrow">{zh ? "最新产品" : "Latest Products"}</p>
              <h2>{zh ? "最新发布" : "Newest Releases"}</h2>
            </div>
            <Link className="text-button" href={`/${locale}/popular`}>
              {zh ? "更多产品" : "More Products"}
            </Link>
          </div>
          <div className="product-grid shop-products">
            {products.map((product) => (
              <ProductCard key={product.slug} locale={locale} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
