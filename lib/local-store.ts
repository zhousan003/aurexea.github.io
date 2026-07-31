import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Locale, Prisma, ProductPlatform, PublishStatus } from "@prisma/client";
import type { ProductCard } from "@/lib/site-data";

type LocalCategory = {
  id: string;
  slug: string;
  sortOrder: number;
  status: PublishStatus;
  translations: Array<{
    id: string;
    categoryId: string;
    locale: Locale;
    name: string;
    description: string | null;
    seoTitle: string | null;
    seoDesc: string | null;
  }>;
  _count: {
    products: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

type StoredLocalCategory = Omit<LocalCategory, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type LocalProductTranslation = {
  id: string;
  productId: string;
  locale: Locale;
  title: string;
  excerpt: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
};

type LocalProductImage = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: Date;
};

type StoredLocalProductImage = Omit<LocalProductImage, "createdAt"> & {
  createdAt: string;
};

type LocalProductFile = {
  id: string;
  productId: string;
  version: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  status: PublishStatus;
  createdAt: Date;
};

type StoredLocalProductFile = Omit<LocalProductFile, "createdAt"> & {
  createdAt: string;
};

export type LocalAdminProduct = {
  id: string;
  categoryId: string | null;
  slug: string;
  platform: ProductPlatform;
  symbol: string | null;
  timeframes: string[];
  status: PublishStatus;
  isPopular: boolean;
  rating: Prisma.Decimal;
  originalPrice: Prisma.Decimal | null;
  freePrice: Prisma.Decimal | null;
  downloadCount: number;
  publishedAt: Date | null;
  category: LocalCategory | null;
  translations: LocalProductTranslation[];
  images: LocalProductImage[];
  files: LocalProductFile[];
  createdAt: Date;
  updatedAt: Date;
};

type StoredLocalProduct = Omit<
  LocalAdminProduct,
  "category" | "rating" | "originalPrice" | "freePrice" | "publishedAt" | "images" | "files" | "createdAt" | "updatedAt"
> & {
  rating: string;
  originalPrice: string | null;
  freePrice: string | null;
  publishedAt: string | null;
  images: StoredLocalProductImage[];
  files: StoredLocalProductFile[];
  createdAt: string;
  updatedAt: string;
};

type LocalStore = {
  categories: StoredLocalCategory[];
  products: StoredLocalProduct[];
};

const storePath = path.join(process.cwd(), ".local-data", "store.json");

function emptyStore(): LocalStore {
  return {
    categories: [],
    products: [],
  };
}

function serializeCategory(category: LocalCategory): StoredLocalCategory {
  return {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function deserializeCategory(category: StoredLocalCategory): LocalCategory {
  return {
    ...category,
    createdAt: new Date(category.createdAt),
    updatedAt: new Date(category.updatedAt),
  };
}

function serializeProduct(product: LocalAdminProduct): StoredLocalProduct {
  const { category: _category, ...serializableProduct } = product;

  return {
    ...serializableProduct,
    rating: product.rating.toString(),
    originalPrice: product.originalPrice?.toString() || null,
    freePrice: product.freePrice?.toString() || null,
    publishedAt: product.publishedAt?.toISOString() || null,
    images: product.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
    files: product.files.map((file) => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function deserializeProduct(product: StoredLocalProduct, categories: LocalCategory[]): LocalAdminProduct {
  return {
    ...product,
    rating: new Prisma.Decimal(product.rating),
    originalPrice: product.originalPrice ? new Prisma.Decimal(product.originalPrice) : null,
    freePrice: product.freePrice ? new Prisma.Decimal(product.freePrice) : null,
    publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
    category: categories.find((category) => category.id === product.categoryId) || null,
    images: product.images.map((image) => ({
      ...image,
      createdAt: new Date(image.createdAt),
    })),
    files: product.files.map((file) => ({
      ...file,
      createdAt: new Date(file.createdAt),
    })),
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };
}

function findTranslation<T extends { locale: Locale }>(translations: T[], locale: Locale) {
  return translations.find((translation) => translation.locale === locale);
}

function productCount(store: LocalStore, categoryId: string) {
  return store.products.filter((product) => product.categoryId === categoryId).length;
}

function categoriesWithCounts(store: LocalStore) {
  return store.categories.map((category) => {
    const localCategory = deserializeCategory(category);
    return {
      ...localCategory,
      _count: {
        products: productCount(store, localCategory.id),
      },
    };
  });
}

async function readStore(): Promise<LocalStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: LocalStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getLocalCategories() {
  const store = await readStore();
  return categoriesWithCounts(store)
    .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getLocalCategoryById(id: string) {
  const categories = await getLocalCategories();
  return categories.find((category) => category.id === id) || null;
}

export async function getLocalProducts() {
  const store = await readStore();
  const categories = categoriesWithCounts(store);
  return store.products
    .map((product) => deserializeProduct(product, categories))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getLocalProductById(id: string) {
  const products = await getLocalProducts();
  return products.find((product) => product.id === id) || null;
}

export async function getLocalProductCards(options: {
  platform?: "mt4" | "mt5";
  popularOnly?: boolean;
  limit?: number;
} = {}): Promise<ProductCard[]> {
  const products = await getLocalProducts();
  const filtered = products.filter((product) => {
    const platformMatched =
      !options.platform ||
      product.platform === ProductPlatform.BOTH ||
      product.platform.toLowerCase() === options.platform;
    const popularMatched = !options.popularOnly || product.isPopular;
    return product.status === PublishStatus.PUBLISHED && platformMatched && popularMatched;
  });
  const cards = filtered.map((product) => mapLocalProductCard(product));
  return typeof options.limit === "number" ? cards.slice(0, options.limit) : cards;
}

export async function getLocalProductCardBySlug(slug: string) {
  const products = await getLocalProducts();
  const product = products.find((item) => item.slug === slug && item.status === PublishStatus.PUBLISHED);
  return product ? mapLocalProductCard(product) : null;
}

export async function saveLocalCategory(input: {
  id?: string | null;
  slug: string;
  sortOrder: number;
  status: PublishStatus;
  nameZh: string;
  nameEn: string;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
}) {
  const store = await readStore();
  const now = new Date();
  const existingIndex = store.categories.findIndex(
    (category) => category.id === input.id || category.slug === input.slug,
  );
  const id = input.id || store.categories[existingIndex]?.id || `local-category-${Date.now()}`;
  const createdAt = store.categories[existingIndex]?.createdAt
    ? new Date(store.categories[existingIndex].createdAt)
    : now;
  const category: LocalCategory = {
    id,
    slug: input.slug,
    sortOrder: input.sortOrder,
    status: input.status,
    translations: [
      {
        id: `${id}-zh`,
        categoryId: id,
        locale: Locale.zh,
        name: input.nameZh,
        description: input.descriptionZh || null,
        seoTitle: null,
        seoDesc: null,
      },
      {
        id: `${id}-en`,
        categoryId: id,
        locale: Locale.en,
        name: input.nameEn,
        description: input.descriptionEn || null,
        seoTitle: null,
        seoDesc: null,
      },
    ],
    _count: {
      products: 0,
    },
    createdAt,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.categories[existingIndex] = serializeCategory(category);
  } else {
    store.categories.push(serializeCategory(category));
  }

  await writeStore(store);
  return category;
}

export async function setLocalCategoryStatus(id: string, status: PublishStatus) {
  const store = await readStore();
  const existingIndex = store.categories.findIndex((category) => category.id === id);

  if (existingIndex < 0) {
    return null;
  }

  const category = deserializeCategory(store.categories[existingIndex]);
  const updatedCategory = {
    ...category,
    status,
    updatedAt: new Date(),
  };

  store.categories[existingIndex] = serializeCategory(updatedCategory);
  await writeStore(store);
  return updatedCategory;
}

export async function deleteLocalCategory(id: string) {
  const store = await readStore();
  const existingCategory = store.categories.find((category) => category.id === id);

  if (!existingCategory) {
    return null;
  }

  store.categories = store.categories.filter((category) => category.id !== id);
  store.products = store.products.map((product) => (
    product.categoryId === id ? { ...product, categoryId: null } : product
  ));
  await writeStore(store);
  return deserializeCategory(existingCategory);
}

export async function saveLocalProduct(input: {
  id?: string | null;
  slug: string;
  categoryId: string | null;
  platform: ProductPlatform;
  symbol: string | null;
  timeframes: string[];
  status: PublishStatus;
  isPopular: boolean;
  rating: number;
  originalPrice: number;
  freePrice: number;
  titleZh: string;
  titleEn: string;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  thumbnailUrl?: string | null;
  reportImageUrls?: string[];
  fileUrl?: string | null;
  fileName?: string;
  version?: string;
}) {
  const store = await readStore();
  const categories = categoriesWithCounts(store);
  const now = new Date();
  const existingIndex = store.products.findIndex((product) => product.id === input.id || product.slug === input.slug);
  const existingProduct = existingIndex >= 0 ? deserializeProduct(store.products[existingIndex], categories) : null;
  const id = input.id || existingProduct?.id || `local-product-${Date.now()}`;
  const createdAt = existingProduct?.createdAt || now;
  const thumbnailImages = input.thumbnailUrl
    ? [
        {
          id: `${id}-thumbnail`,
          productId: id,
          url: input.thumbnailUrl,
          alt: input.titleZh,
          sortOrder: 0,
          createdAt: now,
        },
      ]
    : [];
  const reportImages = (input.reportImageUrls || []).map((url, index) => ({
    id: `${id}-report-${index + 1}`,
    productId: id,
    url,
    alt: `${input.titleZh} 测试报告 ${index + 1}`,
    sortOrder: index + 1,
    createdAt: now,
  }));
  const existingFiles = existingProduct?.files || [];
  const files = input.fileUrl
    ? [
        {
          id: `${id}-file-${Date.now()}`,
          productId: id,
          version: input.version || "1.0.0",
          fileName: input.fileName || "EA package",
          fileUrl: input.fileUrl,
          fileType: (input.fileName || input.fileUrl).split(".").pop() || "zip",
          status: PublishStatus.PUBLISHED,
          createdAt: now,
        },
        ...existingFiles,
      ]
    : existingFiles;
  const product: LocalAdminProduct = {
    id,
    categoryId: input.categoryId,
    slug: input.slug,
    platform: input.platform,
    symbol: input.symbol,
    timeframes: input.timeframes,
    status: input.status,
    isPopular: input.isPopular,
    rating: new Prisma.Decimal(input.rating),
    originalPrice: new Prisma.Decimal(input.originalPrice),
    freePrice: new Prisma.Decimal(input.freePrice),
    downloadCount: existingProduct?.downloadCount || 0,
    publishedAt: input.status === PublishStatus.PUBLISHED ? existingProduct?.publishedAt || now : null,
    category: categories.find((category) => category.id === input.categoryId) || null,
    translations: [
      {
        id: `${id}-zh`,
        productId: id,
        locale: Locale.zh,
        title: input.titleZh,
        excerpt: input.descriptionZh?.slice(0, 120) || null,
        description: input.descriptionZh || null,
        seoTitle: null,
        seoDesc: null,
      },
      {
        id: `${id}-en`,
        productId: id,
        locale: Locale.en,
        title: input.titleEn,
        excerpt: input.descriptionEn?.slice(0, 120) || null,
        description: input.descriptionEn || null,
        seoTitle: null,
        seoDesc: null,
      },
    ],
    images: [...thumbnailImages, ...reportImages],
    files,
    createdAt,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.products[existingIndex] = serializeProduct(product);
  } else {
    store.products.push(serializeProduct(product));
  }

  await writeStore(store);
  return product;
}

export async function setLocalProductStatus(id: string, status: PublishStatus) {
  const store = await readStore();
  const categories = categoriesWithCounts(store);
  const existingIndex = store.products.findIndex((product) => product.id === id);

  if (existingIndex < 0) {
    return null;
  }

  const product = deserializeProduct(store.products[existingIndex], categories);
  const updatedProduct = {
    ...product,
    status,
    publishedAt: status === PublishStatus.PUBLISHED ? product.publishedAt || new Date() : null,
    updatedAt: new Date(),
  };

  store.products[existingIndex] = serializeProduct(updatedProduct);
  await writeStore(store);
  return updatedProduct;
}

export async function deleteLocalProduct(id: string) {
  const store = await readStore();
  const categories = categoriesWithCounts(store);
  const existingProduct = store.products.find((product) => product.id === id);

  if (!existingProduct) {
    return null;
  }

  store.products = store.products.filter((product) => product.id !== id);
  await writeStore(store);
  return deserializeProduct(existingProduct, categories);
}

function mapLocalProductCard(product: LocalAdminProduct): ProductCard {
  const zh = findTranslation(product.translations, Locale.zh);
  const en = findTranslation(product.translations, Locale.en);
  const categoryZh = product.category ? findTranslation(product.category.translations, Locale.zh) : null;
  const categoryEn = product.category ? findTranslation(product.category.translations, Locale.en) : null;

  return {
    id: product.id,
    slug: product.slug,
    titleZh: zh?.title || product.slug,
    titleEn: en?.title || zh?.title || product.slug,
    excerptZh: zh?.excerpt || zh?.description?.slice(0, 80) || "",
    excerptEn: en?.excerpt || en?.description?.slice(0, 80) || zh?.description?.slice(0, 80) || "",
    descriptionZh: zh?.description || "",
    descriptionEn: en?.description || zh?.description || "",
    platform: product.platform === ProductPlatform.BOTH ? "BOTH" : product.platform,
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
