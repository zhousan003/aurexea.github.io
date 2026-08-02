import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import type { HandleUploadBody } from "@vercel/blob/client";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  try {
    const session = getCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

    if (!isValidAdminSession(session)) {
      return NextResponse.json({ ok: false, message: "请先登录后台再上传文件。" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as HandleUploadBody | null;

    if (!body || body.type !== "blob.generate-client-token" || !body.payload.pathname) {
      return NextResponse.json({ ok: false, message: "上传参数缺失。" }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, message: "线上未配置 BLOB_READ_WRITE_TOKEN，请在 Vercel Blob 存储的环境变量中补充后再上传。" },
        { status: 503 },
      );
    }

    const result = await handleUpload({
      request,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["application/octet-stream", "application/zip", "application/x-zip-compressed", "application/x-macbinary", "application/vnd.microsoft.portable-executable", "text/plain"],
        maximumSizeInBytes: 5 * 1024 * 1024 * 1024,
        validUntil: Date.now() + 60 * 60 * 1000,
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "大文件上传接口发生未知错误。" },
      { status: 500 },
    );
  }
}
