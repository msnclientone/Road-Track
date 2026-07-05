import { NextResponse } from "next/server";

import { getRedirectForUser } from "@/lib/auth/login-config";
import {
  hasExceededOtpAttempts,
  hashOtpCode,
  isOtpExpired,
} from "@/lib/auth/otp";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = String(code).trim();
    const secondOtpEmail = `second_otp:${normalizedEmail}`;

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Admin account not found." },
        { status: 404 },
      );
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: secondOtpEmail,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No active verification code found. Request a new code." },
        { status: 400 },
      );
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      return NextResponse.json(
        { error: "Verification code expired. Request a new code." },
        { status: 400 },
      );
    }

    if (hasExceededOtpAttempts(otpRecord.attempts)) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      return NextResponse.json(
        { error: "Too many failed attempts. Request a new code." },
        { status: 429 },
      );
    }

    const codeHash = hashOtpCode(normalizedCode);
    if (codeHash !== otpRecord.codeHash) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Incorrect verification code. Try again." },
        { status: 400 },
      );
    }

    // Mark OTP as consumed
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    const verifiedUser = user.emailVerifiedAt
      ? user
      : await prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });

    const token = await createSessionToken({
      sub: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      partnerStatus: verifiedUser.partnerStatus,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: getRedirectForUser("admin", verifiedUser.partnerStatus),
    });
  } catch (error) {
    console.error("Second OTP verify failed:", error);
    return NextResponse.json(
      { error: "Unable to verify code right now." },
      { status: 500 },
    );
  }
}
