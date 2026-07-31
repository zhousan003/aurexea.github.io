import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "aurexea_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
const DEFAULT_ADMIN_EMAIL = "admin@example.com";

function getSecret() {
  return process.env.AUTH_SECRET || "aurexea-local-development-secret";
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

function safeCompare(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

async function isValidAdminSession(value?: string | null) {
  if (!value) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const issuedTime = Number(issuedAt);

  if (!Number.isFinite(issuedTime)) {
    return false;
  }

  if (Date.now() - issuedTime > ADMIN_SESSION_MAX_AGE * 1000) {
    return false;
  }

  const expectedEmail = getAdminEmail().trim().toLowerCase();
  const expectedSignature = await sha256(`${expectedEmail}:${issuedAt}:${getSecret()}`);

  return safeCompare(signature, expectedSignature);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoggedIn = await isValidAdminSession(session);

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
