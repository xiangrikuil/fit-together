import { afterEach, describe, expect, test } from "vitest";
import { NextRequest } from "next/server";

import {
  SHARED_PASSWORD_COOKIE_NAME,
  createSharedPasswordSession,
} from "@/features/auth/shared-password";
import { proxy } from "./proxy";

const originalRoomPassword = process.env.ROOM_PASSWORD;
const originalAuthSecret = process.env.AUTH_SECRET;

describe("proxy", () => {
  afterEach(() => {
    process.env.ROOM_PASSWORD = originalRoomPassword;
    process.env.AUTH_SECRET = originalAuthSecret;
  });

  test("redirects unauthenticated room pages to login", () => {
    process.env.ROOM_PASSWORD = "train-together";
    process.env.AUTH_SECRET = "test-cookie-secret";

    const response = proxy(
      new NextRequest("https://fit-together.test/room/fit-together"),
    );

    expect(response?.status).toBe(307);
    const location = new URL(response!.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/room/fit-together");
  });

  test("rejects unauthenticated room API requests", async () => {
    process.env.ROOM_PASSWORD = "train-together";
    process.env.AUTH_SECRET = "test-cookie-secret";

    const response = proxy(
      new NextRequest(
        "https://fit-together.test/api/rooms/fit-together/checkins/today",
      ),
    );

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: "Authentication required.",
    });
  });

  test("allows requests with a valid session cookie", () => {
    process.env.ROOM_PASSWORD = "train-together";
    process.env.AUTH_SECRET = "test-cookie-secret";
    const session = createSharedPasswordSession(process.env);
    const request = new NextRequest("https://fit-together.test/room/fit-together", {
      headers: {
        cookie: `${SHARED_PASSWORD_COOKIE_NAME}=${session}`,
      },
    });

    const response = proxy(request);

    expect(response?.headers.get("x-middleware-next")).toBe("1");
  });
});
