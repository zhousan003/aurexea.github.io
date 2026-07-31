import { NextResponse } from "next/server";
import { Locale } from "@prisma/client";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    productId?: string;
    slug?: string;
    fileId?: string;
    locale?: "zh" | "en";
  };
  const locale = body.locale === "en" ? Locale.en : Locale.zh;

  if (hasDatabaseUrl()) {
    const product = body.productId
      ? await prisma.product.findUnique({ where: { id: body.productId }, include: { files: true } }).catch(() => null)
      : body.slug
        ? await prisma.product.findUnique({ where: { slug: body.slug }, include: { files: true } }).catch(() => null)
        : null;

    if (product) {
      const fileId = body.fileId || product.files[0]?.id || null;
      await prisma.$transaction([
        prisma.product.update({
          where: { id: product.id },
          data: {
            downloadCount: {
              increment: 1,
            },
          },
        }),
        prisma.downloadEvent.create({
          data: {
            productId: product.id,
            fileId,
            locale,
            country: request.headers.get("x-vercel-ip-country"),
          },
        }),
      ]).catch(() => null);
    }
  }

  return NextResponse.json({
    ok: true,
    event: "download",
    productId: body.productId ?? null,
    fileId: body.fileId ?? null,
    locale,
  });
}
