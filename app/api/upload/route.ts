import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const uploadRules = {
  "product-image": {
    directory: "product-images",
    maxSize: 8 * 1024 * 1024,
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "ea-file": {
    directory: "ea-files",
    maxSize: 60 * 1024 * 1024,
    extensions: [".ex4", ".ex5", ".mq4", ".mq5", ".zip"],
  },
  "donation-qr": {
    directory: "donation-qr",
    maxSize: 8 * 1024 * 1024,
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
} as const;

type UploadKind = keyof typeof uploadRules;

function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function isUploadKind(value: FormDataEntryValue | null): value is UploadKind {
  return typeof value === "string" && value in uploadRules;
}

function cleanBaseName(fileName: string) {
  return path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "upload";
}

async function uploadToVercelBlob(file: File, filePath: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<{
    put: (pathname: string, body: File, options: { access: "public"; addRandomSuffix?: boolean }) => Promise<{ url: string }>;
  }>;

  try {
    const { put } = await dynamicImport("@vercel/blob");
    const result = await put(filePath, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return result.url;
  } catch {
    return null;
  }
}

async function uploadToLocalPublic(file: File, filePath: string) {
  const arrayBuffer = await file.arrayBuffer();
  const uploadPath = path.join(process.cwd(), "public", "uploads", filePath);
  await mkdir(path.dirname(uploadPath), { recursive: true });
  await writeFile(uploadPath, Buffer.from(arrayBuffer));
  return `/uploads/${filePath}`;
}

export async function POST(request: Request) {
  const session = getCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);

  if (!isValidAdminSession(session)) {
    return NextResponse.json({ ok: false, message: "请先登录后台再上传文件。" }, { status: 401 });
  }

  const formData = await request.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!isUploadKind(kind)) {
    return NextResponse.json({ ok: false, message: "上传类型不正确。" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "请选择要上传的文件。" }, { status: 400 });
  }

  const rule = uploadRules[kind];
  const extension = path.extname(file.name).toLowerCase();

  if (!rule.extensions.includes(extension as never)) {
    return NextResponse.json({ ok: false, message: "文件格式不支持。" }, { status: 400 });
  }

  if (file.size > rule.maxSize) {
    return NextResponse.json({ ok: false, message: "文件大小超过限制。" }, { status: 400 });
  }

  const safeFileName = `${cleanBaseName(file.name)}-${randomUUID()}${extension}`;
  const filePath = `${rule.directory}/${safeFileName}`;
  const blobUrl = await uploadToVercelBlob(file, filePath);
  const url = blobUrl || await uploadToLocalPublic(file, filePath);

  return NextResponse.json({
    ok: true,
    fileName: file.name,
    kind,
    size: file.size,
    storage: blobUrl ? "vercel-blob" : "local-public",
    url,
  });
}
