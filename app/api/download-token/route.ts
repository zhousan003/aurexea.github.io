import { NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    productId?: string;
    slug?: string;
    locale?: "zh" | "en";
  };
  const locale = body.locale === "en" ? "en" : "zh";
  let downloadUrl = "#download-file";

  if (hasDatabaseUrl()) {
    const product = body.productId
      ? await prisma.product.findUnique({ where: { id: body.productId }, include: { files: true } }).catch(() => null)
      : body.slug
        ? await prisma.product.findUnique({ where: { slug: body.slug }, include: { files: true } }).catch(() => null)
        : null;
    if (product?.files[0]) {
      downloadUrl = `/api/download-file?productId=${encodeURIComponent(product.id)}&slug=${encodeURIComponent(product.slug)}&locale=${locale}`;
    }
  }

  return NextResponse.json({
    ok: true,
    productId: body.productId ?? null,
    downloadUrl,
    expiresIn: 300,
  });
}
