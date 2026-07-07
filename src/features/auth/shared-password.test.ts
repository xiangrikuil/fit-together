import { describe, expect, test } from "vitest";

import {
  SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS,
  createSharedPasswordSession,
  isSharedPasswordConfigured,
  isValidSharedPasswordSession,
  sanitizeLoginRedirect,
  verifySharedPassword,
} from "./shared-password";

describe("shared password auth", () => {
  const env = {
    ROOM_PASSWORD: "train-together",
    AUTH_SECRET: "test-cookie-secret",
    NODE_ENV: "production",
  };

  test("is disabled when no shared password is configured", () => {
    expect(isSharedPasswordConfigured({})).toBe(false);
    expect(isSharedPasswordConfigured({ ROOM_PASSWORD: "   " })).toBe(false);
  });

  test("verifies the configured shared password", () => {
    expect(verifySharedPassword("train-together", env)).toBe(true);
    expect(verifySharedPassword("wrong-password", env)).toBe(false);
    expect(verifySharedPassword("train-together", {})).toBe(false);
  });

  test("creates a signed session cookie that remains valid until expiry", () => {
    const now = new Date("2026-07-07T12:00:00.000Z");
    const token = createSharedPasswordSession(env, now);

    expect(token).toMatch(/^v1\.\d+\.[a-f0-9]{64}$/);
    expect(isValidSharedPasswordSession(token, env, now)).toBe(true);

    const beforeExpiry = new Date(
      now.getTime() + SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS * 1000 - 1000,
    );
    expect(isValidSharedPasswordSession(token, env, beforeExpiry)).toBe(true);
  });

  test("rejects expired or tampered session cookies", () => {
    const now = new Date("2026-07-07T12:00:00.000Z");
    const token = createSharedPasswordSession(env, now);
    const afterExpiry = new Date(
      now.getTime() + SHARED_PASSWORD_COOKIE_MAX_AGE_SECONDS * 1000 + 1000,
    );

    expect(isValidSharedPasswordSession(token, env, afterExpiry)).toBe(false);
    expect(isValidSharedPasswordSession(`${token}0`, env, now)).toBe(false);
    expect(isValidSharedPasswordSession("bad-token", env, now)).toBe(false);
  });

  test("rejects session cookies when the shared password is no longer configured", () => {
    const now = new Date("2026-07-07T12:00:00.000Z");
    const token = createSharedPasswordSession(env, now);

    expect(
      isValidSharedPasswordSession(
        token,
        { AUTH_SECRET: env.AUTH_SECRET },
        now,
      ),
    ).toBe(false);
  });

  test("allows only same-origin relative login redirects", () => {
    expect(sanitizeLoginRedirect("/room/fit-together?month=2026-07")).toBe(
      "/room/fit-together?month=2026-07",
    );
    expect(sanitizeLoginRedirect("https://example.com/room/a")).toBe(
      "/room/fit-together",
    );
    expect(sanitizeLoginRedirect("//example.com/room/a")).toBe(
      "/room/fit-together",
    );
    expect(sanitizeLoginRedirect("/login")).toBe("/room/fit-together");
    expect(sanitizeLoginRedirect("/login?next=/room/fit-together")).toBe(
      "/room/fit-together",
    );
  });
});
