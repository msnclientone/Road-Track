import { NextResponse } from "next/server";

import {
  getPortalMismatchMessage,
  roleMatchesPortal,
} from "@/lib/auth/access";
import { sendOtpEmail } from "@/lib/auth/email";
import { getRedirectForUser } from "@/lib/auth/login-config";
import {
  generateOtpCode,
  getOtpExpiryDate,
  hasExceededOtpAttempts,
  hashOtpCode,
  isOtpExpired,
} from "@/lib/auth/otp";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { verifyLoginOtpSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyLoginOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const portal = parsed.data.portal;
    const codeHash = hashOtpCode(parsed.data.code);
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

    const verifiedUser = user.emailVerifiedAt
      ? user
      : await prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });

    if (verifiedUser.role === "SUPER_ADMIN") {
      // Generate second OTP for security email verification
      const secondCode = generateOtpCode();
      const secondCodeHash = hashOtpCode(secondCode);
      const secondExpiresAt = getOtpExpiryDate();

      // Invalidate any previous unconsumed second OTPs
      await prisma.otpCode.updateMany({
        where: { email: `second_otp:${email}`, consumedAt: null },
        data: { consumedAt: new Date() },
      });

      await prisma.otpCode.create({
        data: {
          email: `second_otp:${email}`,
          codeHash: secondCodeHash,
          expiresAt: secondExpiresAt,
        },
      });

      const otpRecipient = process.env.SUPER_ADMIN_OTP_EMAIL;
      if (otpRecipient) {
        await sendOtpEmail({ to: otpRecipient, code: secondCode, purpose: "admin-login" });
      }

      return NextResponse.json({
        ok: true,
        requiresSecondOtp: true,
      });
    }

    const token = await createSessionToken({
      sub: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      partnerStatus: verifiedUser.partnerStatus,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: getRedirectForUser(portal, verifiedUser.partnerStatus),
    });
  } catch (error) {
    console.error("Login OTP verify failed:", error);
    return NextResponse.json(
      { error: "Unable to verify login OTP right now." },
      { status: 500 },
    );
  }
}
