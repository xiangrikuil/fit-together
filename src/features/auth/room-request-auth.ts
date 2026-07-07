import {
  SHARED_PASSWORD_COOKIE_NAME,
  isValidSharedPasswordSession,
} from "./shared-password";

type RoomRequestAuthEnv = Record<string, string | undefined>;

export const isAuthorizedRoomRequest = (
  request: Request,
  env: RoomRequestAuthEnv,
  now = new Date(),
) =>
  isValidSharedPasswordSession(
    getCookieValue(request.headers.get("cookie"), SHARED_PASSWORD_COOKIE_NAME),
    env,
    now,
  );

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName === name) {
      return rawValueParts.join("=");
    }
  }

  return undefined;
};
