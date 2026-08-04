import { AdNetwork, AdPlacement, Locale as PrismaLocale, Prisma, ProductPlatform, PublishStatus } from "@prisma/client";
import type { Locale, ProductCard } from "@/lib/site-data";
import { products as fallbackProducts } from "@/lib/site-data";
import { getLocalCategories, getLocalProductCardBySlug, getLocalProductCards } from "@/lib/local-store";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export type PublicCategory = {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  productCount: number;
};

export type PublicAdSlot = {
  id: string;
  name: string;
  placement: AdPlacement;
  network: AdNetwork;
  desktopCode: string | null;
  mobileCode: string | null;
  fallbackCode: string | null;
  countdownSeconds: number;
  isActive: boolean;
};

export type PublicDonationSetting = {
  titleZh: string;
  titleEn: string;
  descriptionZh: string | null;
  descriptionEn: string | null;
  qr1Network: string;
  qr1Address: string;
  qr1ImageUrl: string | null;
  qr2Network: string | null;
  qr2Address: string | null;
  qr2ImageUrl: string | null;
};

export type PublicGuestMessage = {
  id: string;
  name: string;
  content: string;
  reply: string | null;
  createdAt: string;
  repliedAt: string | null;
};

const productInclude = {
  category: {
    include: {
      translations: true,
    },
  },
  translations: true,
  images: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  files: {
    where: {
      status: PublishStatus.PUBLISHED,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

function normalizePlatform(platform: ProductPlatform): ProductCard["platform"] {
  return platform === ProductPlatform.BOTH ? "BOTH" : platform;
}

function findTranslation<T extends { locale: PrismaLocale }>(translations: T[], locale: PrismaLocale) {
  return translations.find((translation) => translation.locale === locale);
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function mapProduct(product: ProductWithRelations): ProductCard {

  const zh = findTranslation(product.translations, PrismaLocale.zh);
  const en = findTranslation(product.translations, PrismaLocale.en);
  const categoryZh = product.category ? findTranslation(product.category.translations, PrismaLocale.zh) : null;
  const categoryEn = product.category ? findTranslation(product.category.translations, PrismaLocale.en) : null;

  return {
    id: product.id,
    slug: product.slug,
    titleZh: zh?.title || product.slug,
    titleEn: en?.title || zh?.title || product.slug,
    excerptZh: zh?.excerpt || zh?.description?.slice(0, 80) || "",
    excerptEn: en?.excerpt || en?.description?.slice(0, 80) || zh?.description?.slice(0, 80) || "",
    descriptionZh: zh?.description || "",
    descriptionEn: en?.description || zh?.description || "",
    platform: normalizePlatform(product.platform),
    symbol: product.symbol || "-",
    tagZh: categoryZh?.name || "EA",
    tagEn: categoryEn?.name || categoryZh?.name || "EA",
    categorySlug: product.category?.slug,
    rating: Number(product.rating),
    originalPrice: Number(product.originalPrice ?? 0),
    freePrice: Number(product.freePrice ?? 0),
    thumbnailUrl: product.images.find((image) => image.sortOrder === 0)?.url,
    reportImages: product.images.filter((image) => image.sortOrder > 0).map((image) => image.url),
    fileUrl: product.files[0]?.fileUrl,
    fileId: product.files[0]?.id,
    downloadCount: product.downloadCount,
    isPopular: product.isPopular,
    createdAt: product.createdAt.toISOString(),
  };
}

export async function getProducts(options: {
  locale?: Locale;
  platform?: "mt4" | "mt5";
  popularOnly?: boolean;
  limit?: number;
} = {}) {
  if (!hasDatabaseUrl()) {
    const localProducts = await getLocalProductCards(options);
    return localProducts.length ? localProducts : filterFallbackProducts(options);
  }

  try {
    const where = {
      status: PublishStatus.PUBLISHED,
      ...(options.platform === "mt4"
        ? { platform: { in: [ProductPlatform.MT4, ProductPlatform.BOTH] } }
        : {}),
      ...(options.platform === "mt5"
        ? { platform: { in: [ProductPlatform.MT5, ProductPlatform.BOTH] } }
        : {}),
      ...(options.popularOnly ? { isPopular: true } : {}),
    };

    const dbProducts = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: options.limit,
    });

    if (!dbProducts.length) {
      return filterFallbackProducts(options);
    }

    return dbProducts.map((product) => mapProduct(product));
  } catch {
    return filterFallbackProducts(options);
  }
}

export async function getProductBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return await getLocalProductCardBySlug(slug) || fallbackProducts.find((product) => product.slug === slug) || null;
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: PublishStatus.PUBLISHED,
      },
      include: productInclude,
    });

    return product ? mapProduct(product) : null;
  } catch {
    return fallbackProducts.find((item) => item.slug === slug) || null;
  }
}

export async function getCategories(): Promise<PublicCategory[]> {
  if (!hasDatabaseUrl()) {
    const localCategories = await getLocalCategories();
    if (localCategories.length) {
      return localCategories
        .filter((category) => category.status === PublishStatus.PUBLISHED)
        .map((category) => ({
          id: category.id,
          slug: category.slug,
          nameZh: findTranslation(category.translations, PrismaLocale.zh)?.name || category.slug,
          nameEn:
            findTranslation(category.translations, PrismaLocale.en)?.name ||
            findTranslation(category.translations, PrismaLocale.zh)?.name ||
            category.slug,
          productCount: category._count.products,
        }));
    }

    return [
      { id: "mt4", slug: "mt4ea", nameZh: "MT4EA", nameEn: "MT4 EA", productCount: 128 },
      { id: "mt5", slug: "mt5ea", nameZh: "MT5EA", nameEn: "MT5 EA", productCount: 96 },
      { id: "gold-ea", slug: "gold-ea", nameZh: "黄金 EA", nameEn: "Gold EA", productCount: 72 },
      { id: "scalping-ea", slug: "scalping-ea", nameZh: "剥头皮 EA", nameEn: "Scalping EA", productCount: 41 },
    ];
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        status: PublishStatus.PUBLISHED,
      },
      include: {
        translations: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      nameZh: findTranslation(category.translations, PrismaLocale.zh)?.name || category.slug,
      nameEn:
        findTranslation(category.translations, PrismaLocale.en)?.name ||
        findTranslation(category.translations, PrismaLocale.zh)?.name ||
        category.slug,
      productCount: category._count.products,
    }));
  } catch {
    return [];
  }
}

export async function getDownloadAdSlot(): Promise<PublicAdSlot | null> {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await prisma.adSlot.findFirst({
      where: {
        placement: AdPlacement.DOWNLOAD_PAGE_MAIN,
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch {
    return null;
  }
}

export async function getDonationSetting(): Promise<PublicDonationSetting | null> {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await prisma.donationSetting.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch {
    return null;
  }
}

export async function getPublicGuestMessages(locale: Locale, limit = 12): Promise<PublicGuestMessage[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const messages = await prisma.guestMessage.findMany({
      where: {
        locale: locale === "en" ? PrismaLocale.en : PrismaLocale.zh,
        status: PublishStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return messages.map((message) => ({
      id: message.id,
      name: message.name,
      content: message.content,
      reply: message.reply,
      createdAt: message.createdAt.toISOString(),
      repliedAt: message.repliedAt?.toISOString() || null,
    }));
  } catch {
    return [];
  }
}

function filterFallbackProducts(options: {
  platform?: "mt4" | "mt5";
  popularOnly?: boolean;
  limit?: number;
}) {
  const filtered = fallbackProducts.filter((product) => {
    const platformMatched =
      !options.platform ||
      product.platform === "BOTH" ||
      product.platform.toLowerCase() === options.platform;
    const popularMatched = !options.popularOnly || product.isPopular;
    return platformMatched && popularMatched;
  });

  return typeof options.limit === "number" ? filtered.slice(0, options.limit) : filtered;
}
