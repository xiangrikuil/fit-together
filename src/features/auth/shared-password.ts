import { createHash, createHmac, timingSafeEqual } from "crypto";

export const SHARED_PASSWORD_COOKIE_NAME = "fit_together_session";
export const SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

const sessionVersion = "v1";
const defaultLoginRedirect = "/room/fit-together";
const localOrigin = "https://fit-together.local";

type SharedPasswordEnv = Record<string, string | undefined>;

export const isSharedPasswordConfigured = (env: SharedPasswordEnv) =>
  Boolean(getSharedPassword(env));

export const verifySharedPassword = (
  password: string,
  env: SharedPasswordEnv,
) => {
  const expectedPassword = getSharedPassword(env);

  if (!expectedPassword) {
    return false;
  }

  return secureEqual(sha256(password), sha256(expectedPassword));
};

export const createSharedPasswordSession = (
  env: SharedPasswordEnv,
  now = new Date(),
) => {
  const secret = getSigningSecret(env);

  if (!secret) {
    throw new Error("ROOM_PASSWORD is required to create a session.");
  }

  const expiresAt = now.getTime() + SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS * 1000;
  const payload = `${sessionVersion}.${expiresAt}`;

  return `${payload}.${sign(payload, secret)}`;
};

export const isValidSharedPasswordSession = (
  token: string | undefined,
  env: SharedPasswordEnv,
  now = new Date(),
) => {
  const secret = getSigningSecret(env);

  if (!isSharedPasswordConfigured(env) || !secret || !token) {
    return false;
  }

  const [version, rawExpiresAt, signature, ...extraParts] = token.split(".");

  if (
    extraParts.length > 0 ||
    version !== sessionVersion ||
    !rawExpiresAt ||
    !signature ||
    !/^\d+$/.test(rawExpiresAt)
  ) {
    return false;
  }

  const expiresAt = Number(rawExpiresAt);

  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now.getTime()) {
    return false;
  }

  return secureEqual(signature, sign(`${version}.${rawExpiresAt}`, secret));
};

export const getSharedPasswordCookieOptions = (env: SharedPasswordEnv) => ({
  httpOnly: true,
  maxAge: SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
});

export const sanitizeLoginRedirect = (redirectTo?: string | null) => {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return defaultLoginRedirect;
  }

  try {
    const url = new URL(redirectTo, localOrigin);
    const sanitized = `${url.pathname}${url.search}${url.hash}`;

    if (url.origin !== localOrigin || url.pathname === "/login") {
      return defaultLoginRedirect;
    }

    return sanitized;
  } catch {
    return defaultLoginRedirect;
  }
};

const getSharedPassword = (env: SharedPasswordEnv) => {
  const password = env.ROOM_PASSWORD?.trim();

  return password ? password : null;
};

const getSigningSecret = (env: SharedPasswordEnv) => {
  const authSecret = env.AUTH_SECRET?.trim();

  return authSecret || getSharedPassword(env);
};

const sha256 = (value: string) => createHash("sha256").update(value).digest();

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("hex");

const secureEqual = (left: Buffer | string, right: Buffer | string) => {
  const leftBuffer = Buffer.isBuffer(left) ? left : Buffer.from(left);
  const rightBuffer = Buffer.isBuffer(right) ? right : Buffer.from(right);

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};
