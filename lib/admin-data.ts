import { Prisma, PublishStatus } from "@prisma/client";
import { startOfLocalDay } from "@/lib/analytics-utils";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { getLocalCategories, getLocalCategoryById, getLocalProductById, getLocalProducts } from "@/lib/local-store";

export type AdminProduct = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        translations: true;
      };
    };
    translations: true;
    images: true;
    files: true;
  };
}>;

export type AdminProductRecord = AdminProduct | Awaited<ReturnType<typeof getLocalProducts>>[number];

export type AdminCategory = Prisma.CategoryGetPayload<{
  include: {
    translations: true;
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

export async function getAdminProducts() {
  if (!hasDatabaseUrl()) return getLocalProducts();

  try {
    return await prisma.product.findMany({
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        translations: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        files: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch {
    return [];
  }
}

export async function getAdminProductById(id: string) {
  if (!hasDatabaseUrl()) return getLocalProductById(id);

  try {
    return await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        translations: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        files: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getAdminCategories() {
  if (!hasDatabaseUrl()) return getLocalCategories();

  try {
    return await prisma.category.findMany({
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
  } catch {
    return [];
  }
}

export async function getAdminCategoryById(id: string) {
  if (!hasDatabaseUrl()) return getLocalCategoryById(id);

  try {
    return await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        translations: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getAdminAdSlot() {
  if (!hasDatabaseUrl()) return null;

  try {
    return await prisma.adSlot.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch {
    return null;
  }
}

export async function getAdminDonationSetting() {
  if (!hasDatabaseUrl()) return null;

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

export async function getAdminSeoSettings() {
  if (!hasDatabaseUrl()) return [];

  try {
    return await prisma.seoSetting.findMany({
      orderBy: [{ path: "asc" }, { locale: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getAdminDashboardData() {
  if (!hasDatabaseUrl()) {
    return {
      todayVisits: 0,
      todayUniqueVisitors: 0,
      todayDownloads: 0,
      publishedProducts: 0,
      activeAds: 0,
      dailyVisits: [],
      downloadRanking: [],
    };
  }

  try {
    const today = startOfLocalDay();
    const [todayVisits, todayUniqueVisitors, todayDownloads, publishedProducts, activeAds, downloadRanking] = await Promise.all([
      prisma.visitEvent.count({ where: { createdAt: { gte: today } } }),
      prisma.visitEvent
        .groupBy({
          by: ["ipHash"],
          where: {
            createdAt: { gte: today },
            ipHash: { not: null },
          },
        })
        .then((visitors) => visitors.length),
      prisma.downloadEvent.count({ where: { createdAt: { gte: today } } }),
      prisma.product.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.adSlot.count({ where: { isActive: true } }),
      prisma.product.findMany({
        include: {
          translations: true,
        },
        orderBy: {
          downloadCount: "desc",
        },
        take: 5,
      }),
    ]);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });

    const dailyVisits = await Promise.all(
      days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const count = await prisma.visitEvent.count({
          where: {
            createdAt: {
              gte: day,
              lt: nextDay,
            },
          },
        });

        return {
          label: day.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      }),
    );

    return {
      todayVisits,
      todayUniqueVisitors,
      todayDownloads,
      publishedProducts,
      activeAds,
      dailyVisits,
      downloadRanking: downloadRanking.map((product) => ({
        id: product.id,
        title: product.translations.find((translation) => translation.locale === "zh")?.title || product.slug,
        downloads: product.downloadCount,
      })),
    };
  } catch {
    return {
      todayVisits: 0,
      todayUniqueVisitors: 0,
      todayDownloads: 0,
      publishedProducts: 0,
      activeAds: 0,
      dailyVisits: [],
      downloadRanking: [],
    };
  }
}
