import { NextResponse } from "next/server";
import { Locale } from "@prisma/client";
import { getClientIp, hashVisitorIp } from "@/lib/analytics-utils";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
    locale?: "zh" | "en";
    referrer?: string;
  };
  const locale = body.locale === "en" ? Locale.en : Locale.zh;

  if (hasDatabaseUrl()) {
    const ipHash = hashVisitorIp(getClientIp(request.headers));

    await prisma.visitEvent.create({
      data: {
        path: body.path || "/",
        locale,
        referrer: body.referrer || null,
        userAgent: request.headers.get("user-agent"),
        country: request.headers.get("x-vercel-ip-country"),
        ipHash,
      },
    }).catch(() => null);
  }

  return NextResponse.json({
    ok: true,
    event: "page_view",
    path: body.path ?? "/",
    locale,
  });
}
