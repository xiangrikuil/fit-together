import { afterEach, describe, expect, test } from "vitest";

import { SHARED_PASSWORD_COOKIE_NAME } from "@/features/auth/shared-password";
import { POST } from "./route";

const originalRoomPassword = process.env.ROOM_PASSWORD;
const originalAuthSecret = process.env.AUTH_SECRET;

describe("POST /api/auth/login", () => {
  afterEach(() => {
    process.env.ROOM_PASSWORD = originalRoomPassword;
    process.env.AUTH_SECRET = originalAuthSecret;
  });

  test("sets a long-lived session cookie and redirects to the requested room", async () => {
    process.env.ROOM_PASSWORD = "train-together";
    process.env.AUTH_SECRET = "test-cookie-secret";
    const response = await POST(
      createLoginRequest({
        password: "train-together",
        next: "/room/fit-together?month=2026-07",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("set-cookie")).toContain(
      `${SHARED_PASSWORD_COOKIE_NAME}=v1.`,
    );

    const location = new URL(response.headers.get("location")!);
    expect(`${location.pathname}${location.search}`).toBe(
      "/room/fit-together?month=2026-07",
    );
  });

  test("rejects a wrong password without setting a session cookie", async () => {
    process.env.ROOM_PASSWORD = "train-together";
    process.env.AUTH_SECRET = "test-cookie-secret";
    const response = await POST(
      createLoginRequest({
        password: "wrong-password",
        next: "/room/fit-together",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("set-cookie")).toBeNull();

    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("error")).toBe("invalid");
    expect(location.searchParams.get("next")).toBe("/room/fit-together");
  });
});

const createLoginRequest = (input: { password: string; next: string }) => {
  const formData = new FormData();
  formData.set("password", input.password);
  formData.set("next", input.next);

  return new Request("https://fit-together.test/api/auth/login", {
    method: "POST",
    body: formData,
  });
};
