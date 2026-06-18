import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import {
  getLoginPathForRole,
  getRequiredRoleForPath,
} from "@/lib/auth/access";
import { SESSION_COOKIE } from "@/lib/auth/session";

const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon",
  "/road-track-logo",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function readSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      partnerStatus:
        typeof payload.partnerStatus === "string"
          ? payload.partnerStatus
          : null,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRoleForPath(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const session = await readSession(request);

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = getLoginPathForRole(requiredRole);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== requiredRole) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = getLoginPathForRole(requiredRole);
    loginUrl.searchParams.set("error", "wrong-role");
    return NextResponse.redirect(loginUrl);
  }

  if (
    (requiredRole === "RESORT_OWNER" || requiredRole === "VEHICLE_OWNER") &&
    pathname.endsWith("/pending") === false &&
    session.partnerStatus !== "APPROVED"
  ) {
    const pendingUrl = request.nextUrl.clone();
    pendingUrl.pathname =
      requiredRole === "RESORT_OWNER"
        ? "/resort-owner/pending"
        : "/vehicle-owner/pending";
    return NextResponse.redirect(pendingUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/resort-owner/:path*", "/vehicle-owner/:path*"],
};
