import Link from "next/link";
import type { Locale, ProductCard } from "@/lib/site-data";
import { formatProductPrice, getLocalizedTitle } from "@/lib/site-data";

export function ProductDetail({ locale, product }: { locale: Locale; product: ProductCard }) {
  const zh = locale === "zh";
  const title = getLocalizedTitle(locale, product);
  const description = zh ? product.descriptionZh : product.descriptionEn;

  return (
    <>
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
            <span>{product.platform}</span>
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
              <dd>{product.platform}</dd>
            </div>
            <div>
              <dt>{zh ? "交易品种" : "Symbol"}</dt>
              <dd>{product.symbol}</dd>
            </div>
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
        <p>{description || (zh ? "暂无详情介绍。" : "No product description yet.")}</p>
      </section>
    </>
  );
}
