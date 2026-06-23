import { NextResponse } from "next/server";

import { sendOtpEmail } from "@/lib/auth/email";
import {
  generateOtpCode,
  getOtpExpiryDate,
  hashOtpCode,
} from "@/lib/auth/otp";
import { sendOtpSchema } from "@/lib/auth/validation";
import { getLoginPortalConfig } from "@/lib/auth/login-config";
import { prisma } from "@/lib/prisma";

const RESEND_WINDOW_MS = 10 * 60 * 1000;
const MAX_RESENDS = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const portal = (parsed.data as any).portal ?? "customer";

    const portalConfig = getLoginPortalConfig(portal as any);
    // Allow admin OTP only for initial bootstrap (no existing SUPER_ADMIN)
    if (portal === "admin") {
      const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdminCount > 0) {
        return NextResponse.json(
          { error: "Registration is not allowed for this portal." },
          { status: 403 },
        );
      }
    } else if (!portalConfig.canSelfRegister) {
      return NextResponse.json(
        { error: "Registration is not allowed for this portal." },
        { status: 403 },
      );
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const recentCodes = await prisma.otpCode.count({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - RESEND_WINDOW_MS) },
      },
    });

    if (recentCodes >= MAX_RESENDS) {
      return NextResponse.json(
        { error: "Too many OTP requests. Try again in 10 minutes." },
        { status: 429 },
      );
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);

    await prisma.otpCode.create({
      data: {
        email,
        codeHash,
        expiresAt: getOtpExpiryDate(),
      },
    });

    const delivery = await sendOtpEmail({ to: email, code });

    return NextResponse.json({
      ok: true,
      message: delivery.delivered
        ? "OTP sent. It expires in 5 minutes."
        : "OTP generated for development. Check server logs.",
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("OTP send failed:", error);
    return NextResponse.json(
      { error: "Unable to send OTP right now." },
      { status: 500 },
    );
  }
}
