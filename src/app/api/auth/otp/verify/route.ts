import { NextResponse } from "next/server";

import {
  hasExceededOtpAttempts,
  hashOtpCode,
  isOtpExpired,
} from "@/lib/auth/otp";
import {
  createSignupToken,
  setSignupCookie,
} from "@/lib/auth/session";
import { verifyOtpSchema, sendOtpSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const portal = (parsed.data as any).portal as string | undefined;
    const codeHash = hashOtpCode(parsed.data.code);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No active OTP found. Request a new code." },
        { status: 400 },
      );
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      return NextResponse.json(
        { error: "OTP expired. Request a new code." },
        { status: 400 },
      );
    }

    if (hasExceededOtpAttempts(otpRecord.attempts)) {
      return NextResponse.json(
        { error: "Too many OTP attempts. Request a new code." },
        { status: 429 },
      );
    }

    if (otpRecord.codeHash !== codeHash) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(
        { error: "Incorrect OTP. Check your email and try again." },
        { status: 400 },
      );
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    const signupToken = await createSignupToken(email, portal);
    await setSignupCookie(signupToken);

    return NextResponse.json({
      ok: true,
      needsRegistration: true,
      message: "Email verified. Set your password to finish sign up.",
    });
  } catch (error) {
    console.error("OTP verify failed:", error);
    return NextResponse.json(
      { error: "Unable to verify OTP right now." },
      { status: 500 },
    );
  }
}
