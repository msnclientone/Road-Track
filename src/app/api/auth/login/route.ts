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

    const email = parsed.data.email.toLowerCase();
    const portal = parsed.data.portal;

    const user = await prisma.user.findUnique({ where: { email } });

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
