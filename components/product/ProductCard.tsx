import Link from "next/link";
import type { Locale, ProductCard as ProductCardType } from "@/lib/site-data";
import { formatProductPrice, getLocalizedTag, getLocalizedTitle } from "@/lib/site-data";

function renderStars(rating: number) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return "★★★★★".slice(0, roundedRating) + "☆☆☆☆☆".slice(0, 5 - roundedRating);
}

export function ProductCard({ locale, product }: { locale: Locale; product: ProductCardType }) {
  const title = getLocalizedTitle(locale, product);
  const tag = getLocalizedTag(locale, product);
  const detailHref = `/${locale}/products/${product.slug}`;

  return (
    <article className="product-card">
      <Link
        className={`product-media gold product-media-link${product.thumbnailUrl ? " has-image" : ""}`}
        href={detailHref}
        aria-label={title}
      >
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={title} />
        ) : (
          <>
            <span className="sale-badge">{locale === "zh" ? "免费" : "Free"}</span>
            <strong>{tag}</strong>
          </>
        )}
      </Link>
      <div className="product-body">
        <div className="product-tags">
          <span>{locale === "zh" ? "EA智能交易" : "EA"}</span>
          <span>{product.platform}</span>
          <span>{tag}</span>
        </div>
        <h3>
          <Link className="product-title-link" href={detailHref}>
            {title}
          </Link>
        </h3>
        <p className="stock-line">{locale === "zh" ? "有库存" : "In stock"}</p>
        <div className="star-rating" aria-label={`${locale === "zh" ? "推荐星级" : "Rating"} ${product.rating}/5`}>
          <span>{renderStars(product.rating)}</span>
          <small>{product.rating.toFixed(1)}</small>
        </div>
        <p className="price-line">
          <del>{formatProductPrice(locale, product.originalPrice)}</del>
          <strong>{formatProductPrice(locale, product.freePrice)}</strong>
        </p>
        <Link className="card-button" href={detailHref}>
          {locale === "zh" ? "快速下载" : "Quick Download"}
        </Link>
      </div>
    </article>
  );
}
