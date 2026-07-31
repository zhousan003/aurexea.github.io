import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "aurexea_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin123456";

function getSecret() {
  return process.env.AUTH_SECRET || "aurexea-local-development-secret";
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

function getPasswordHash() {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (configuredHash && configuredHash !== "replace-with-password-hash") {
    return configuredHash;
  }

  return hashAdminPassword(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD);
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashAdminPassword(password: string) {
  return createHash("sha256").update(`${password}:${getSecret()}`).digest("hex");
}

export function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = getAdminEmail().trim().toLowerCase();
  const inputHash = hashAdminPassword(password);

  return safeCompare(normalizedEmail, expectedEmail) && safeCompare(inputHash, getPasswordHash());
}

export function createAdminSessionValue() {
  const email = getAdminEmail().trim().toLowerCase();
  const issuedAt = Date.now().toString();
  const signature = createHash("sha256").update(`${email}:${issuedAt}:${getSecret()}`).digest("hex");

  return `${issuedAt}.${signature}`;
}

export function isValidAdminSession(value?: string | null) {
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
  const expectedSignature = createHash("sha256")
    .update(`${expectedEmail}:${issuedAt}:${getSecret()}`)
    .digest("hex");

  return safeCompare(signature, expectedSignature);
}

export function getAdminLoginHint() {
  return {
    email: getAdminEmail(),
    usesDefaultPassword:
      !process.env.ADMIN_PASSWORD &&
      (!process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH === "replace-with-password-hash"),
  };
}
