"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Locale, PublishStatus } from "@prisma/client";
import { getClientIp, hashVisitorIp } from "@/lib/analytics-utils";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function submitGuestMessage(formData: FormData) {
  const locale = clean(formData.get("locale"), 2) === "en" ? Locale.en : Locale.zh;
  const redirectPath = `/${locale}/messages`;
  const honeypot = clean(formData.get("website"), 160);

  if (honeypot) {
    redirect(`${redirectPath}?sent=1`);
  }

  const name = clean(formData.get("name"), 40);
  const email = clean(formData.get("email"), 120);
  const content = clean(formData.get("content"), 1200);

  if (!name || content.length < 6) {
    redirect(`${redirectPath}?error=1`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`${redirectPath}?error=1`);
  }

  const requestHeaders = await headers();

  const message = await prisma.guestMessage
    .create({
      data: {
        locale,
        name,
        email: email || null,
        content,
        status: PublishStatus.DRAFT,
        country: requestHeaders.get("x-vercel-ip-country"),
        userAgent: requestHeaders.get("user-agent"),
        ipHash: hashVisitorIp(getClientIp(requestHeaders)),
      },
    })
    .catch(() => null);

  if (!message) {
    redirect(`${redirectPath}?error=1`);
  }

  revalidatePath("/admin/messages");
  redirect(`${redirectPath}?sent=1`);
}
