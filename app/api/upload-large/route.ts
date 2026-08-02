import { NextResponse } from "next/server";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  const session = getCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

  if (!isValidAdminSession(session)) {
    return NextResponse.json({ ok: false, message: "请先登录后台再上传文件。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        pathname?: string;
        clientPayload?: string | null;
        multipart?: boolean;
      }
    | null;

  if (!body?.pathname) {
    return NextResponse.json({ ok: false, message: "上传参数缺失。" }, { status: 400 });
  }

  const clientToken = await generateClientTokenFromReadWriteToken({
    token: process.env.BLOB_READ_WRITE_TOKEN || "",
    pathname: body.pathname,
    allowedContentTypes: ["application/octet-stream", "application/zip", "application/x-zip-compressed", "application/x-macbinary", "text/plain"],
    maximumSizeInBytes: 5 * 1024 * 1024 * 1024,
    validUntil: Date.now() + 60 * 60 * 1000,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({
    token: clientToken,
    pathname: body.pathname,
    multipart: Boolean(body.multipart),
    clientPayload: body.clientPayload || null,
  });
}
