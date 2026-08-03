import { createHash } from "crypto";

const IP_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "true-client-ip",
];

function firstHeaderValue(value: string | null) {
  return value?.split(",").map((item) => item.trim()).find(Boolean) || null;
}

export function getClientIp(headers: Headers) {
  for (const header of IP_HEADERS) {
    const value = firstHeaderValue(headers.get(header));
    if (value) {
      return value;
    }
  }

  return null;
}

export function hashVisitorIp(ip: string | null) {
  if (!ip) return null;

  const salt = process.env.AUTH_SECRET || process.env.ADMIN_EMAIL || "aurexea-analytics";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function startOfLocalDay(date = new Date()) {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}
