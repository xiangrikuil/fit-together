import { NextRequest, NextResponse } from "next/server";

import {
  SHARED_PASSWORD_COOKIE_NAME,
  isValidSharedPasswordSession,
} from "@/features/auth/shared-password";

export function proxy(request: NextRequest) {
  if (hasValidSession(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/rooms/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/room/:path*", "/api/rooms/:path*"],
};

const hasValidSession = (request: NextRequest) =>
  isValidSharedPasswordSession(
    request.cookies.get(SHARED_PASSWORD_COOKIE_NAME)?.value,
    process.env,
  );

