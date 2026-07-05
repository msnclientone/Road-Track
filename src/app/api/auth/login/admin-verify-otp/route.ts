import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashOtpCode, isOtpExpired, hasExceededOtpAttempts } from "@/lib/auth/otp";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = String(code).trim();

    // Find the latest unconsumed OTP for this email
    const otpRecord = await prisma.otpCode.findFirst({
      where: { email: normalizedEmail, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new OTP." },
        { status: 400 },
      );
    }

    if (hasExceededOtpAttempts(otpRecord.attempts)) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 },
      );
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      return NextResponse.json(
        { error: "OTP expired. Please request a new OTP." },
        { status: 400 },
      );
    }

    const codeHash = hashOtpCode(normalizedCode);
    if (codeHash !== otpRecord.codeHash) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Invalid OTP." },
        { status: 400 },
      );
    }

    // Mark OTP as consumed
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Admin account not found." },
        { status: 404 },
      );
    }

    if (!user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    // Create session
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerStatus: user.partnerStatus,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: "/admin",
    });
  } catch (error) {
    console.error("Admin OTP verify failed:", error);
    return NextResponse.json(
      { error: "Unable to verify OTP." },
      { status: 500 },
    );
  }
}
