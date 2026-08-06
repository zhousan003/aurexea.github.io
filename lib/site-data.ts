export type Locale = "zh" | "en";

export type ProductCard = {
  id?: string;
  slug: string;
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  descriptionZh?: string;
  descriptionEn?: string;
  platform: "MT4" | "MT5" | "BOTH";
  symbol: string;
  tagZh: string;
  tagEn: string;
  categorySlug?: string;
  rating: number;
  originalPrice: number;
  freePrice: number;
  thumbnailUrl?: string;
  reportImages?: string[];
  fileUrl?: string;
  fileId?: string;
  downloadCount?: number;
  isPopular?: boolean;
  createdAt?: string;
};

export const defaultAdSenseClientId = "ca-pub-2360255171901038";

const officialSiteUrl = "https://www.aurexea.cc";

export const site = {
  name: "AurexEA",
  brandZh: "曜汇EA",
  siteUrl: getSiteUrl(),
};

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const isLocalUrl = configuredUrl ? /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredUrl) : false;
  const hostname = configuredUrl ? getHostname(configuredUrl) : "";
  const isVercelGeneratedUrl = /\.vercel\.app$/i.test(hostname);

  if (process.env.NODE_ENV === "production" && (isLocalUrl || isVercelGeneratedUrl)) {
    return officialSiteUrl;
  }

  return configuredUrl || officialSiteUrl;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    try {
      return new URL(`https://${url}`).hostname;
    } catch {
      return "";
    }
  }
}

export const products: ProductCard[] = [
  {
    slug: "gold-quant-scalper-mt5",
    titleZh: "带 SetFiles 的黄金量化剥头皮 EA MT5",
    titleEn: "Gold Quant Scalper MT5 + SetFiles",
    excerptZh: "适用于 XAUUSD 的短线量化模型，包含 EA 文件和安装说明。",
    excerptEn: "An XAUUSD short-term quant model with EA files and setup notes.",
    platform: "MT5",
    symbol: "XAUUSD",
    tagZh: "黄金 EA",
    tagEn: "Gold EA",
    rating: 5,
    originalPrice: 399,
    freePrice: 0,
    reportImages: [],
    isPopular: true,
  },
  {
    slug: "london-session-scalper-mt4",
    titleZh: "带 SetFiles 的伦敦盘短线 EA MT4",
    titleEn: "London Session Scalper MT4 EA",
    excerptZh: "专注于 EURUSD 与 GBPUSD 的短线自动交易工具。",
    excerptEn: "A short-term automation tool focused on EURUSD and GBPUSD.",
    platform: "MT4",
    symbol: "EURUSD",
    tagZh: "剥头皮 EA",
    tagEn: "Scalping EA",
    rating: 4.5,
    originalPrice: 299,
    freePrice: 0,
    reportImages: [],
    isPopular: true,
  },
];

export function getLocalizedTitle(locale: Locale, product: ProductCard) {
  return locale === "zh" ? product.titleZh : product.titleEn;
}

export function getLocalizedExcerpt(locale: Locale, product: ProductCard) {
  return locale === "zh" ? product.excerptZh : product.excerptEn;
}

export function getLocalizedTag(locale: Locale, product: ProductCard) {
  return locale === "zh" ? product.tagZh : product.tagEn;
}

export function formatProductPrice(locale: Locale, price: number) {
  if (price <= 0) {
    return locale === "zh" ? "免费" : "Free";
  }

  return locale === "zh" ? `${price.toFixed(2)} 美元` : `$${price.toFixed(2)}`;
}
