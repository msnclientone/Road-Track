import { NextResponse } from "next/server";

import {
  getPortalMismatchMessage,
  roleMatchesPortal,
} from "@/lib/auth/access";
import { getRedirectForUser } from "@/lib/auth/login-config";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

const VEHICLE_PREFIX = "ROADV";
const RESORT_PREFIX = "ROADR";

function isEmail(value: string): boolean {
  return value.includes("@");
}

function isVehicleOwnerId(value: string): boolean {
  return /^ROADV\d{4}$/i.test(value);
}

function isResortOwnerId(value: string): boolean {
  return /^ROADR\d{4}$/i.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const raw = parsed.data.email.trim();
    const portal = parsed.data.portal;

    let user = null;

    if (isEmail(raw)) {
      const email = raw.toLowerCase();
      user = await prisma.user.findUnique({ where: { email } });
    } else if (isVehicleOwnerId(raw)) {
      const id = raw.toUpperCase();
      user = await prisma.user.findUnique({ where: { vehicleOwnerId: id } });
    } else if (isResortOwnerId(raw)) {
      const id = raw.toUpperCase();
      user = await prisma.user.findUnique({ where: { resortOwnerId: id } });
    } else if (portal === "customer" || portal === "admin") {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: "Enter a valid email or login ID." },
        { status: 400 },
      );
    }

    if (!user?.passwordHash) {
      return NextResponse.json(
        {
          error:
            portal === "customer"
              ? "No account found. Create an account to continue."
              : "No account found for this login portal.",
        },
        { status: 401 },
      );
    }

    const passwordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    if (!roleMatchesPortal(user.role, portal)) {
      return NextResponse.json(
        { error: getPortalMismatchMessage(portal) },
        { status: 403 },
      );
    }

    if (!user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerStatus: user.partnerStatus,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: getRedirectForUser(portal, user.partnerStatus),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
