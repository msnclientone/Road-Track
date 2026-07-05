import { NextResponse } from "next/server";

import { sendOtpEmail } from "@/lib/auth/email";
import {
  generateOtpCode,
  getOtpExpiryDate,
  hashOtpCode,
} from "@/lib/auth/otp";
import { prisma } from "@/lib/prisma";

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const secondOtpEmail = `second_otp:${normalizedEmail}`;

    // Check cooldown
    const lastOtp = await prisma.otpCode.findFirst({
      where: { email: secondOtpEmail },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const elapsed = Date.now() - lastOtp.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before requesting a new code.` },
          { status: 429 },
        );
      }
    }

    // Invalidate previous unconsumed OTPs
    await prisma.otpCode.updateMany({
      where: { email: secondOtpEmail, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    // Generate and store new OTP
    const otpCode = generateOtpCode();
    const otpHash = hashOtpCode(otpCode);
    const expiresAt = getOtpExpiryDate();

    await prisma.otpCode.create({
      data: {
        email: secondOtpEmail,
        codeHash: otpHash,
        expiresAt,
      },
    });

    const otpRecipient = process.env.SUPER_ADMIN_OTP_EMAIL;
    if (!otpRecipient) {
      return NextResponse.json(
        { error: "Server configuration error: OTP recipient not set." },
        { status: 500 },
      );
    }

    await sendOtpEmail({ to: otpRecipient, code: otpCode, purpose: "admin-login" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Second OTP resend failed:", error);
    return NextResponse.json(
      { error: "Unable to resend verification code." },
      { status: 500 },
    );
  }
}
