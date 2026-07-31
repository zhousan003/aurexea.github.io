import { ProductCard } from "@/components/product/ProductCard";
import type { Locale, ProductCard as ProductCardType } from "@/lib/site-data";

export function CategoryPage({
  locale,
  kind,
  products,
}: {
  locale: Locale;
  kind: "mt4" | "mt5" | "popular";
  products: ProductCardType[];
}) {
  const zh = locale === "zh";

  const titleMap = {
    mt4: zh ? "MT4EA 免费下载" : "Free MT4 EAs",
    mt5: zh ? "MT5EA 免费下载" : "Free MT5 EAs",
    popular: zh ? "热门 EA 推荐" : "Popular EA Picks",
  };

  return (
    <>
      <div className="catalog-header">
        <div>
          <p className="eyebrow">{kind === "popular" ? (zh ? "热门 EA" : "Popular EA") : kind.toUpperCase()}</p>
          <h1>{titleMap[kind]}</h1>
          <p>
            {zh
              ? "按平台、品种和策略类型整理，方便快速找到合适的免费 EA。"
              : "Organized by platform, symbol and strategy so traders can find free EAs faster."}
          </p>
        </div>
      </div>
      <div className="product-grid shop-products compact-grid">
        {products.map((product) => (
          <ProductCard key={product.slug} locale={locale} product={product} />
        ))}
      </div>
    </>
  );
}
