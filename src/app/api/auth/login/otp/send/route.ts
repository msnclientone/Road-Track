import { NextResponse } from "next/server";

import {
  getPortalMismatchMessage,
  roleMatchesPortal,
} from "@/lib/auth/access";
import { sendOtpEmail } from "@/lib/auth/email";
import {
  generateOtpCode,
  getOtpExpiryDate,
  hashOtpCode,
} from "@/lib/auth/otp";
import { sendLoginOtpSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

const RESEND_WINDOW_MS = 10 * 60 * 1000;
const MAX_RESENDS = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendLoginOtpSchema.safeParse(body);

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

    if (!roleMatchesPortal(user.role, portal)) {
      return NextResponse.json(
        { error: getPortalMismatchMessage(portal) },
        { status: 403 },
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

    await prisma.otpCode.create({
      data: {
        email,
        codeHash: hashOtpCode(code),
        expiresAt: getOtpExpiryDate(),
      },
    });

    const delivery = await sendOtpEmail({
      to: email,
      code,
      purpose: "login",
    });

    return NextResponse.json({
      ok: true,
      message: delivery.delivered
        ? "Login OTP sent. It expires in 5 minutes."
        : "Login OTP generated for development. Check server logs.",
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Login OTP send failed:", error);
    return NextResponse.json(
      { error: "Unable to send login OTP right now." },
      { status: 500 },
    );
  }
}
