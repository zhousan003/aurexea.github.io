"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  AdNetwork,
  AdPlacement,
  Locale,
  ProductPlatform,
  PublishStatus,
} from "@prisma/client";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import {
  deleteLocalCategory,
  deleteLocalProduct,
  saveLocalCategory,
  saveLocalProduct,
  setLocalCategoryStatus,
  setLocalProductStatus,
} from "@/lib/local-store";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

function requireDatabase() {
  if (!hasDatabaseUrl()) {
    throw new Error("请先配置 DATABASE_URL 后再保存后台数据。");
  }
}

async function requireAdmin() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminSession(session)) {
    throw new Error("请先登录后台。");
  }
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optionalStr(formData: FormData, key: string) {
  const value = str(formData, key);
  return value || null;
}

function decimalNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(str(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function productPlatform(value: string) {
  if (value === "MT4") return ProductPlatform.MT4;
  if (value === "MT5") return ProductPlatform.MT5;
  return ProductPlatform.BOTH;
}

function publishStatus(value: string) {
  if (value === "草稿" || value === "DRAFT") return PublishStatus.DRAFT;
  if (value === "下架" || value === "ARCHIVED") return PublishStatus.ARCHIVED;
  return PublishStatus.PUBLISHED;
}

function revalidatePublicPages(slug?: string) {
  ["/zh", "/en", "/zh/mt4ea", "/en/mt4ea", "/zh/mt5ea", "/en/mt5ea", "/zh/popular", "/en/popular"].forEach((path) => {
    revalidatePath(path);
  });

  if (slug) {
    revalidatePath(`/zh/products/${slug}`);
    revalidatePath(`/en/products/${slug}`);
    revalidatePath(`/zh/download/${slug}`);
    revalidatePath(`/en/download/${slug}`);
  }
}

function getProductData(formData: FormData, status: PublishStatus, categoryId: string | null) {
  return {
    slug: str(formData, "slug"),
    categoryId,
    platform: productPlatform(str(formData, "platform")),
    symbol: optionalStr(formData, "symbol"),
    timeframes: str(formData, "timeframes")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status,
    isPopular: formData.get("isPopular") === "on",
    rating: decimalNumber(formData, "rating", 5),
    originalPrice: decimalNumber(formData, "originalPrice", 0),
    freePrice: decimalNumber(formData, "freePrice", 0),
    publishedAt: status === PublishStatus.PUBLISHED ? new Date() : null,
  };
}

async function upsertProductTranslation(productId: string, locale: Locale, formData: FormData) {
  const suffix = locale === Locale.zh ? "Zh" : "En";
  const description = optionalStr(formData, `description${suffix}`);

  await prisma.productTranslation.upsert({
    where: {
      productId_locale: {
        productId,
        locale,
      },
    },
    create: {
      productId,
      locale,
      title: str(formData, `title${suffix}`),
      excerpt: description?.slice(0, 120) || null,
      description,
      seoTitle: optionalStr(formData, `seoTitle${suffix}`),
      seoDesc: optionalStr(formData, `seoDesc${suffix}`),
    },
    update: {
      title: str(formData, `title${suffix}`),
      excerpt: description?.slice(0, 120) || null,
      description,
      seoTitle: optionalStr(formData, `seoTitle${suffix}`),
      seoDesc: optionalStr(formData, `seoDesc${suffix}`),
    },
  });
}

async function upsertCategoryTranslation(categoryId: string, locale: Locale, formData: FormData) {
  const suffix = locale === Locale.zh ? "Zh" : "En";

  await prisma.categoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId,
        locale,
      },
    },
    create: {
      categoryId,
      locale,
      name: str(formData, `name${suffix}`),
      description: optionalStr(formData, `description${suffix}`),
    },
    update: {
      name: str(formData, `name${suffix}`),
      description: optionalStr(formData, `description${suffix}`),
    },
  });
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = optionalStr(formData, "id");
  const slug = str(formData, "slug");
  const titleZh = str(formData, "titleZh");
  const titleEn = str(formData, "titleEn");
  const categoryId = optionalStr(formData, "categoryId");
  const status = publishStatus(str(formData, "status"));
  const thumbnailUrl = optionalStr(formData, "thumbnailUrl");
  const reportImageUrls = str(formData, "reportImageUrls")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const fileUrl = optionalStr(formData, "fileUrl");
  const fileName = optionalStr(formData, "fileName") || fileUrl?.split("/").pop() || "EA package";

  if (!slug || !titleZh || !titleEn) {
    throw new Error("产品标题和 Slug 必填。");
  }

  if (!hasDatabaseUrl()) {
    const status = publishStatus(str(formData, "status"));
    await saveLocalProduct({
      id,
      slug,
      categoryId,
      platform: productPlatform(str(formData, "platform")),
      symbol: optionalStr(formData, "symbol"),
      timeframes: str(formData, "timeframes")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status,
      isPopular: formData.get("isPopular") === "on",
      rating: decimalNumber(formData, "rating", 5),
      originalPrice: decimalNumber(formData, "originalPrice", 0),
      freePrice: decimalNumber(formData, "freePrice", 0),
      titleZh,
      titleEn,
      descriptionZh: optionalStr(formData, "descriptionZh"),
      descriptionEn: optionalStr(formData, "descriptionEn"),
      thumbnailUrl,
      reportImageUrls,
      fileUrl,
      fileName,
      version: str(formData, "version") || "1.0.0",
    });

    revalidatePath("/admin/products");
    revalidatePublicPages(slug);
    redirect(`/admin/products?saved=1&slug=${encodeURIComponent(slug)}`);
    return;
  }

  requireDatabase();

  const product = id
    ? await prisma.product.update({
        where: { id },
        data: getProductData(formData, status, categoryId),
      })
    : await prisma.product.create({
        data: getProductData(formData, status, categoryId),
      });

  await Promise.all([
    upsertProductTranslation(product.id, Locale.zh, formData),
    upsertProductTranslation(product.id, Locale.en, formData),
  ]);

  await prisma.productImage.deleteMany({
    where: {
      productId: product.id,
      sortOrder: 0,
    },
  });

  if (thumbnailUrl) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: thumbnailUrl,
        alt: titleZh,
        sortOrder: 0,
      },
    });
  }

  await prisma.productImage.deleteMany({
    where: {
      productId: product.id,
      sortOrder: {
        gt: 0,
      },
    },
  });

  if (reportImageUrls.length) {
    await prisma.productImage.createMany({
      data: reportImageUrls.map((url, index) => ({
        productId: product.id,
        url,
        alt: `${titleZh} 测试报告 ${index + 1}`,
        sortOrder: index + 1,
      })),
    });
  }

  if (fileUrl) {
    await prisma.productFile.create({
      data: {
        productId: product.id,
        version: str(formData, "version") || "1.0.0",
        fileName,
        fileUrl,
        fileType: fileName.split(".").pop() || "zip",
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePublicPages(slug);
  redirect(`/admin/products?saved=1&slug=${encodeURIComponent(slug)}`);
}

export async function setProductStatus(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const status = publishStatus(str(formData, "status"));

  if (!hasDatabaseUrl()) {
    const product = await setLocalProductStatus(id, status);
    revalidatePath("/admin/products");
    revalidatePublicPages(product?.slug);
    return;
  }

  requireDatabase();

  const product = await prisma.product.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/products");
  revalidatePublicPages(product.slug);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");

  if (!hasDatabaseUrl()) {
    const product = await deleteLocalProduct(id);
    revalidatePath("/admin/products");
    revalidatePublicPages(product?.slug);
    return;
  }

  requireDatabase();

  const product = await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePublicPages(product.slug);
  redirect("/admin/products?deleted=1");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();

  const id = optionalStr(formData, "id");
  const slug = str(formData, "slug");
  const nameZh = str(formData, "nameZh");
  const nameEn = str(formData, "nameEn");

  if (!slug || !nameZh || !nameEn) {
    throw new Error("分类名称和 Slug 必填。");
  }

  if (!hasDatabaseUrl()) {
    const category = await saveLocalCategory({
      id,
      slug,
      sortOrder: decimalNumber(formData, "sortOrder", 0),
      status: publishStatus(str(formData, "status")),
      nameZh,
      nameEn,
      descriptionZh: optionalStr(formData, "descriptionZh"),
      descriptionEn: optionalStr(formData, "descriptionEn"),
    });

    revalidatePath("/admin/categories");
    revalidatePublicPages(category.slug);
    redirect(`/admin/categories?saved=1&slug=${encodeURIComponent(category.slug)}`);
    return;
  }

  const categoryData = {
    slug,
    sortOrder: decimalNumber(formData, "sortOrder", 0),
    status: publishStatus(str(formData, "status")),
  };
  const category = id
    ? await prisma.category.update({ where: { id }, data: categoryData })
    : await prisma.category.create({ data: categoryData });

  await Promise.all([
    upsertCategoryTranslation(category.id, Locale.zh, formData),
    upsertCategoryTranslation(category.id, Locale.en, formData),
  ]);

  revalidatePath("/admin/categories");
  revalidatePublicPages(category.slug);
  redirect(`/admin/categories?saved=1&slug=${encodeURIComponent(category.slug)}`);
}

export async function setCategoryStatus(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const status = publishStatus(str(formData, "status"));

  if (!hasDatabaseUrl()) {
    const category = await setLocalCategoryStatus(id, status);
    revalidatePath("/admin/categories");
    revalidatePublicPages(category?.slug);
    return;
  }

  const category = await prisma.category.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/categories");
  revalidatePublicPages(category.slug);
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");

  if (!hasDatabaseUrl()) {
    const category = await deleteLocalCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePublicPages(category?.slug);
    return;
  }

  const category = await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePublicPages(category.slug);
  redirect("/admin/categories?deleted=1");
}

export async function saveAdSlot(formData: FormData) {
  await requireAdmin();
  requireDatabase();

  const id = optionalStr(formData, "id") || "download-main";

  await prisma.adSlot.upsert({
    where: { id },
    create: {
      id,
      name: str(formData, "name"),
      placement: AdPlacement.DOWNLOAD_PAGE_MAIN,
      network: str(formData, "network") === "CUSTOM" ? AdNetwork.CUSTOM : AdNetwork.ADSENSE,
      desktopSize: str(formData, "desktopSize") || "RESPONSIVE",
      mobileSize: str(formData, "mobileSize") || "RESPONSIVE",
      desktopCode: optionalStr(formData, "desktopCode"),
      mobileCode: optionalStr(formData, "mobileCode"),
      fallbackCode: optionalStr(formData, "fallbackCode"),
      countdownSeconds: decimalNumber(formData, "countdownSeconds", 5),
      isActive: formData.get("isActive") === "on",
    },
    update: {
      name: str(formData, "name"),
      network: str(formData, "network") === "CUSTOM" ? AdNetwork.CUSTOM : AdNetwork.ADSENSE,
      desktopSize: str(formData, "desktopSize") || "RESPONSIVE",
      mobileSize: str(formData, "mobileSize") || "RESPONSIVE",
      desktopCode: optionalStr(formData, "desktopCode"),
      mobileCode: optionalStr(formData, "mobileCode"),
      fallbackCode: optionalStr(formData, "fallbackCode"),
      countdownSeconds: decimalNumber(formData, "countdownSeconds", 5),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/ads");
}

export async function saveDonationSetting(formData: FormData) {
  await requireAdmin();
  requireDatabase();

  const id = optionalStr(formData, "id") || "default-donation";

  await prisma.donationSetting.upsert({
    where: { id },
    create: {
      id,
      titleZh: str(formData, "titleZh"),
      titleEn: str(formData, "titleEn"),
      descriptionZh: optionalStr(formData, "descriptionZh"),
      descriptionEn: optionalStr(formData, "descriptionEn"),
      qr1Network: str(formData, "qr1Network"),
      qr1Address: str(formData, "qr1Address"),
      qr1ImageUrl: optionalStr(formData, "qr1ImageUrl"),
      qr2Network: optionalStr(formData, "qr2Network"),
      qr2Address: optionalStr(formData, "qr2Address"),
      qr2ImageUrl: optionalStr(formData, "qr2ImageUrl"),
    },
    update: {
      titleZh: str(formData, "titleZh"),
      titleEn: str(formData, "titleEn"),
      descriptionZh: optionalStr(formData, "descriptionZh"),
      descriptionEn: optionalStr(formData, "descriptionEn"),
      qr1Network: str(formData, "qr1Network"),
      qr1Address: str(formData, "qr1Address"),
      qr1ImageUrl: optionalStr(formData, "qr1ImageUrl"),
      qr2Network: optionalStr(formData, "qr2Network"),
      qr2Address: optionalStr(formData, "qr2Address"),
      qr2ImageUrl: optionalStr(formData, "qr2ImageUrl"),
    },
  });

  revalidatePath("/admin/donations");
  revalidatePath("/zh");
  revalidatePath("/en");
}

export async function saveSeoSetting(formData: FormData) {
  await requireAdmin();
  requireDatabase();

  const path = str(formData, "path");
  const locale = str(formData, "locale") === "en" ? Locale.en : Locale.zh;

  await prisma.seoSetting.upsert({
    where: { path_locale: { path, locale } },
    create: {
      path,
      locale,
      title: str(formData, "title"),
      description: optionalStr(formData, "description"),
      canonical: optionalStr(formData, "canonical"),
      ogImageUrl: optionalStr(formData, "ogImageUrl"),
    },
    update: {
      title: str(formData, "title"),
      description: optionalStr(formData, "description"),
      canonical: optionalStr(formData, "canonical"),
      ogImageUrl: optionalStr(formData, "ogImageUrl"),
    },
  });

  revalidatePath("/admin/seo");
  revalidatePath(path);
}
