import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Locale, PublishStatus } from "@prisma/client";
import { getClientIp, hashVisitorIp } from "@/lib/analytics-utils";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function redirectTo(request: Request, path: string, status: "sent" | "error") {
  const url = new URL(path, request.url);
  url.searchParams.set(status, "1");
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = clean(formData.get("locale"), 2) === "en" ? Locale.en : Locale.zh;
  const redirectPath = `/${locale}/messages`;
  const honeypot = clean(formData.get("website"), 160);

  if (honeypot) {
    return redirectTo(request, redirectPath, "sent");
  }

  const name = clean(formData.get("name"), 40);
  const email = clean(formData.get("email"), 120);
  const content = clean(formData.get("content"), 1200);

  if (!name || content.length < 6 || !hasDatabaseUrl()) {
    return redirectTo(request, redirectPath, "error");
  }

  try {
    await prisma.guestMessage.create({
      data: {
        locale,
        name,
        email: email || null,
        content,
        status: PublishStatus.DRAFT,
        country: request.headers.get("x-vercel-ip-country"),
        userAgent: request.headers.get("user-agent"),
        ipHash: hashVisitorIp(getClientIp(request.headers)),
      },
    });
  } catch {
    return redirectTo(request, redirectPath, "error");
  }

  revalidatePath("/admin/messages");
  revalidatePath("/zh/messages");
  revalidatePath("/en/messages");

  return redirectTo(request, redirectPath, "sent");
}
