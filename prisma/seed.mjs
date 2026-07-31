import { PrismaClient, Locale, ProductPlatform, PublishStatus, AdNetwork, AdPlacement } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "gold-quant-scalper-mt5",
    titleZh: "带 SetFiles 的黄金量化剥头皮 EA MT5",
    titleEn: "Gold Quant Scalper MT5 + SetFiles",
    excerptZh: "适用于 XAUUSD 的短线量化模型，包含 EA 文件和安装说明。",
    excerptEn: "An XAUUSD short-term quant model with EA files and setup notes.",
    platform: ProductPlatform.MT5,
    symbol: "XAUUSD",
    categorySlug: "gold-ea",
    rating: 5,
    originalPrice: 399,
    freePrice: 0,
  },
  {
    slug: "london-session-scalper-mt4",
    titleZh: "带 SetFiles 的伦敦盘短线 EA MT4",
    titleEn: "London Session Scalper MT4 EA",
    excerptZh: "专注于 EURUSD 与 GBPUSD 的短线自动交易工具。",
    excerptEn: "A short-term automation tool focused on EURUSD and GBPUSD.",
    platform: ProductPlatform.MT4,
    symbol: "EURUSD",
    categorySlug: "scalping-ea",
    rating: 4.5,
    originalPrice: 299,
    freePrice: 0,
  },
];

async function seedCategory(slug, sortOrder, zh, en, descriptionZh, descriptionEn) {
  const category = await prisma.category.upsert({
    where: { slug },
    create: {
      slug,
      sortOrder,
      status: PublishStatus.PUBLISHED,
    },
    update: {
      sortOrder,
      status: PublishStatus.PUBLISHED,
    },
  });

  await prisma.categoryTranslation.upsert({
    where: { categoryId_locale: { categoryId: category.id, locale: Locale.zh } },
    create: { categoryId: category.id, locale: Locale.zh, name: zh, description: descriptionZh },
    update: { name: zh, description: descriptionZh },
  });

  await prisma.categoryTranslation.upsert({
    where: { categoryId_locale: { categoryId: category.id, locale: Locale.en } },
    create: { categoryId: category.id, locale: Locale.en, name: en, description: descriptionEn },
    update: { name: en, description: descriptionEn },
  });

  return category;
}

async function main() {
  const categories = {
    "gold-ea": await seedCategory("gold-ea", 1, "黄金 EA", "Gold EA", "黄金、贵金属和 XAUUSD 自动交易工具。", "Automation tools for gold, metals and XAUUSD."),
    "scalping-ea": await seedCategory("scalping-ea", 2, "剥头皮 EA", "Scalping EA", "短线、伦敦盘和高频策略工具。", "Short-term, London session and scalping strategy tools."),
  };

  for (const product of products) {
    const dbProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        slug: product.slug,
        categoryId: categories[product.categorySlug].id,
        platform: product.platform,
        symbol: product.symbol,
        timeframes: ["M5", "M15", "H1"],
        status: PublishStatus.PUBLISHED,
        isPopular: true,
        rating: product.rating,
        originalPrice: product.originalPrice,
        freePrice: product.freePrice,
        publishedAt: new Date(),
      },
      update: {
        categoryId: categories[product.categorySlug].id,
        platform: product.platform,
        symbol: product.symbol,
        status: PublishStatus.PUBLISHED,
        isPopular: true,
        rating: product.rating,
        originalPrice: product.originalPrice,
        freePrice: product.freePrice,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: dbProduct.id, locale: Locale.zh } },
      create: {
        productId: dbProduct.id,
        locale: Locale.zh,
        title: product.titleZh,
        excerpt: product.excerptZh,
        description: "策略逻辑、适用品种、安装步骤、参数建议、回测说明和版本更新记录。",
      },
      update: {
        title: product.titleZh,
        excerpt: product.excerptZh,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: dbProduct.id, locale: Locale.en } },
      create: {
        productId: dbProduct.id,
        locale: Locale.en,
        title: product.titleEn,
        excerpt: product.excerptEn,
        description: "Strategy logic, supported symbols, setup steps, parameters, backtest notes and version updates.",
      },
      update: {
        title: product.titleEn,
        excerpt: product.excerptEn,
      },
    });
  }

  await prisma.adSlot.upsert({
    where: { id: "download-main" },
    create: {
      id: "download-main",
      name: "下载等待页主广告位",
      placement: AdPlacement.DOWNLOAD_PAGE_MAIN,
      network: AdNetwork.ADSENSE,
      desktopSize: "RESPONSIVE",
      mobileSize: "RESPONSIVE",
      countdownSeconds: 5,
      isActive: true,
    },
    update: {},
  });

  await prisma.donationSetting.upsert({
    where: { id: "default-donation" },
    create: {
      id: "default-donation",
      titleZh: "请支持网站发展",
      titleEn: "Please support the site",
      descriptionZh: "你的打赏将用于服务器、文件存储、产品整理和网站持续更新。",
      descriptionEn: "Your donation helps cover servers, storage and content updates.",
      qr1Network: "USDT TRC20",
      qr1Address: "TAurexEAxxxxxxxxxxxxxxxxxxxx",
      qr2Network: "USDT ERC20",
      qr2Address: "0x7ec946743ef255f5E8AAAA4Ad6572Ebd7ce7165D4",
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
