import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import type { Locale, ProductCard } from "@/lib/site-data";
import { formatProductPrice, getLocalizedTitle, site } from "@/lib/site-data";

export function ProductDetail({ locale, product }: { locale: Locale; product: ProductCard }) {
  const zh = locale === "zh";
  const title = getLocalizedTitle(locale, product);
  const description = (zh ? product.descriptionZh : product.descriptionEn) || (zh ? product.excerptZh : product.excerptEn);
  const platform = product.platform === "BOTH" ? "MT4/MT5" : product.platform;
  const canonical = new URL(`/${locale}/products/${product.slug}`, site.siteUrl).toString();
  const productImage = product.thumbnailUrl ? new URL(product.thumbnailUrl, site.siteUrl).toString() : undefined;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": ["Product", "SoftwareApplication"],
      name: title,
      ...(description ? { description } : {}),
      applicationCategory: "FinanceApplication",
      operatingSystem: "Windows",
      url: canonical,
      ...(productImage ? { image: productImage } : {}),
      additionalProperty: { "@type": "PropertyValue", name: zh ? "交易平台" : "Trading platform", value: platform },
      ...(product.fileUrl ? {
        offers: {
          "@type": "Offer",
          price: product.freePrice,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: canonical,
        },
      } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: zh ? "首页" : "Home",
          item: new URL(`/${locale}`, site.siteUrl).toString(),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: canonical,
        },
      ],
    },
  ];

  return (
    <>
      <meta property="og:type" content="product" />
      <JsonLd data={structuredData} />
      <div className="product-detail">
        <div className="detail-gallery">
          <div className={`terminal-preview detail-main-media${product.thumbnailUrl ? " has-image" : ""}`}>
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={title} />
            ) : (
              <>
                <div className="terminal-head">
                  <span />
                  <span />
                  <span />
                  <strong>{title}</strong>
                </div>
                <div className="terminal-chart">
                  <i style={{ height: "36%" }} />
                  <i style={{ height: "61%" }} />
                  <i style={{ height: "44%" }} />
                  <i style={{ height: "74%" }} />
                  <i style={{ height: "58%" }} />
                  <i style={{ height: "83%" }} />
                </div>
              </>
            )}
          </div>
          {product.reportImages?.length ? (
            <div className="report-image-grid">
              {product.reportImages.map((imageUrl, index) => (
                <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer">
                  <img src={imageUrl} alt={`${title} ${zh ? "测试报告" : "test report"} ${index + 1}`} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <aside className="detail-summary">
          <div className="product-tags">
            <span>{zh ? "EA智能交易" : "EA"}</span>
            <span>{platform}</span>
            <span>{product.symbol}</span>
          </div>
          <h1>{title}</h1>
          <p className="price-line large">
            <del>{formatProductPrice(locale, product.originalPrice)}</del>
            <strong>{formatProductPrice(locale, product.freePrice)}</strong>
          </p>
          <dl className="detail-spec">
            <div>
              <dt>{zh ? "交易平台" : "Trading platform"}</dt>
              <dd>{platform}</dd>
            </div>
            <div>
              <dt>{zh ? "交易品种" : "Symbol"}</dt>
              <dd>{product.symbol}</dd>
            </div>
            {product.timeframes?.length ? (
              <div>
                <dt>{zh ? "时间周期" : "Timeframes"}</dt>
                <dd>{product.timeframes.join(", ")}</dd>
              </div>
            ) : null}
            <div>
              <dt>{zh ? "产品文件" : "Package"}</dt>
              <dd>{zh ? "EA 文件 + SetFiles" : "EA file + SetFiles"}</dd>
            </div>
          </dl>
          <div className="download-box">
            <h2>{zh ? "免费下载" : "Free Download"}</h2>
            <p>
              {zh
                ? "点击后进入下载等待页，5 秒后显示下载地址。"
                : "Open the download waiting page. The download link appears after 5 seconds."}
            </p>
            <Link className="primary-button full download-cta" href={`/${locale}/download/${product.slug}`}>
              {zh ? "进入下载页" : "Open Download Page"}
            </Link>
          </div>
        </aside>
      </div>
      <section className="content-tabs">
        <h2>{zh ? "产品说明" : "Product Description"}</h2>
        <p className="product-description">{description || (zh ? "暂无详情介绍。" : "No product description yet.")}</p>
      </section>
      <section className="content-tabs">
        <h2>{zh ? "风险提示" : "Trading Risk"}</h2>
        <p>{zh ? "历史表现不代表未来结果。实盘前请先在模拟账户测试。" : "Past performance does not guarantee future results. Test on a demo account before trading live."}</p>
        <Link className="text-button" href={`/${locale}/about`}>{zh ? "了解测试报告与交易风险" : "About test reports and trading risk"}</Link>
      </section>
    </>
  );
}
