import { NextResponse } from "next/server";

import {
  SHARED_PASSWORD_COOKIE_NAME,
  createSharedPasswordSession,
  getSharedPasswordCookieOptions,
  isSharedPasswordConfigured,
  sanitizeLoginRedirect,
  verifySharedPassword,
} from "@/features/auth/shared-password";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = getFormValue(formData, "password");
  const next = sanitizeLoginRedirect(getFormValue(formData, "next"));

  if (!isSharedPasswordConfigured(process.env)) {
    return redirectToLogin(request, next, "config");
  }

  if (!verifySharedPassword(password, process.env)) {
    return redirectToLogin(request, next, "invalid");
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(
    SHARED_PASSWORD_COOKIE_NAME,
    createSharedPasswordSession(process.env),
    getSharedPasswordCookieOptions(process.env),
  );

  return response;
}

const getFormValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const redirectToLogin = (request: Request, next: string, error: string) => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("error", error);

  return NextResponse.redirect(loginUrl, 303);
};
