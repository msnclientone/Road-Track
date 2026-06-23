import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "road_track_session";
export const SIGNUP_COOKIE = "road_track_signup";
const SESSION_TTL = "30d";
const SIGNUP_TTL = "15m";

import type { LoginPortal } from "@/lib/auth/login-config";

export type SignupPayload = {
  email: string;
  portal?: LoginPortal;
};

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  partnerStatus: string | null;
};

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    partnerStatus: payload.partnerStatus,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    const partnerStatus = payload.partnerStatus;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }

    return {
      sub,
      email,
      role: role as UserRole,
      partnerStatus:
        typeof partnerStatus === "string" ? partnerStatus : null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function createSignupToken(
  email: string,
  portal?: LoginPortal,
): Promise<string> {
  const payload: Record<string, unknown> = { purpose: "signup", email };
  if (portal) payload.portal = portal;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(SIGNUP_TTL)
    .sign(getAuthSecret());
}

export async function verifySignupToken(
  token: string,
): Promise<SignupPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (payload.purpose !== "signup" || typeof payload.email !== "string") {
      return null;
    }

    return {
      email: payload.email,
      portal: typeof payload.portal === "string" ? (payload.portal as LoginPortal) : undefined,
    };
  } catch {
    return null;
  }
}

export async function setSignupCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SIGNUP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
}

export async function clearSignupCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SIGNUP_COOKIE);
}

export async function getSignupSession(): Promise<SignupPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SIGNUP_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySignupToken(token);
}
