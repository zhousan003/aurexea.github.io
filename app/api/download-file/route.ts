import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Locale } from "@prisma/client";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

function sanitizeDownloadName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120) || "EA-package";
}

function extensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match?.[1] || "zip";
  } catch {
    return "zip";
  }
}

async function getFileInfo(productId?: string, slug?: string, locale: Locale = Locale.zh) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const product = productId
    ? await prisma.product.findUnique({
        where: { id: productId },
        include: {
          translations: true,
          files: {
            orderBy: { createdAt: "desc" },
          },
        },
      }).catch(() => null)
    : slug
      ? await prisma.product.findUnique({
          where: { slug },
          include: {
            translations: true,
            files: {
              orderBy: { createdAt: "desc" },
            },
          },
        }).catch(() => null)
      : null;

  if (!product) {
    return null;
  }

  const file = product.files.find((item) => item.status === "PUBLISHED") || product.files[0];

  if (!file) {
    return { missingFile: true as const, productSlug: product.slug };
  }

  const zhTitle = product.translations.find((item) => item.locale === Locale.zh)?.title || product.slug;
  const enTitle = product.translations.find((item) => item.locale === Locale.en)?.title || zhTitle;
  const title = locale === Locale.en ? enTitle : zhTitle;
  const fileName = sanitizeDownloadName(title);
  const extension = file.fileType || extensionFromUrl(file.fileUrl);
  const downloadName = fileName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
    ? fileName
    : `${fileName}.${extension}`;

  return {
    url: file.fileUrl,
    downloadName,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") || undefined;
  const slug = searchParams.get("slug") || undefined;
  const locale = searchParams.get("locale") === "en" ? Locale.en : Locale.zh;

  const info = await getFileInfo(productId, slug, locale);

  if (!info) {
    return NextResponse.json({ ok: false, message: "未找到可下载文件。" }, { status: 404 });
  }

  if ("missingFile" in info) {
    return NextResponse.json({ ok: false, message: "该产品尚未配置下载文件。" }, { status: 404 });
  }

  if (info.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", info.url);
    const file = await readFile(filePath).catch(() => null);

    if (!file) {
      return NextResponse.json({ ok: false, message: "文件读取失败。" }, { status: 502 });
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${info.downloadName.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const downloadSource = new URL(info.url, request.url);
  const response = await fetch(downloadSource, { cache: "no-store" }).catch(() => null);

  if (!response?.ok || !response.body) {
    return NextResponse.json({ ok: false, message: "文件读取失败。" }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${info.downloadName.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
