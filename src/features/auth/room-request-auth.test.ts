import { describe, expect, test } from "vitest";

import {
  SHARED_PASSWORD_COOKIE_NAME,
  createSharedPasswordSession,
} from "./shared-password";
import { isAuthorizedRoomRequest } from "./room-request-auth";

describe("room request auth", () => {
  const env = {
    ROOM_PASSWORD: "train-together",
    AUTH_SECRET: "test-cookie-secret",
  };

  test("rejects requests without the shared password session cookie", () => {
    const request = new Request("https://fit-together.test/api/rooms/a");

    expect(isAuthorizedRoomRequest(request, env)).toBe(false);
  });

  test("accepts requests with a valid shared password session cookie", () => {
    const session = createSharedPasswordSession(env);
    const request = new Request("https://fit-together.test/api/rooms/a", {
      headers: {
        cookie: `theme=dark; ${SHARED_PASSWORD_COOKIE_NAME}=${session}`,
      },
    });

    expect(isAuthorizedRoomRequest(request, env)).toBe(true);
  });

  test("rejects requests with a tampered shared password session cookie", () => {
    const session = createSharedPasswordSession(env);
    const request = new Request("https://fit-together.test/api/rooms/a", {
      headers: {
        cookie: `${SHARED_PASSWORD_COOKIE_NAME}=${session}0`,
      },
    });

    expect(isAuthorizedRoomRequest(request, env)).toBe(false);
  });
});
