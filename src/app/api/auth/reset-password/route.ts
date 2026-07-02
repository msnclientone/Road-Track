import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import {
  hashResetToken,
  isResetTokenExpired,
  hasExceededResetAttempts,
} from "@/lib/auth/reset-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.password?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        fieldErrors.token?.[0] ??
        "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const tokenHash = hashResetToken(token);

    const stored = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!stored) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    if (isResetTokenExpired(stored.expiresAt)) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 },
      );
    }

    if (hasExceededResetAttempts(stored.attempts)) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new reset link." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: stored.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { consumedAt: new Date(), attempts: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Your password has been reset successfully.",
    });
  } catch (err) {
    console.error("reset-password failed:", err);
    return NextResponse.json(
      { error: "Unable to reset password. Please try again later." },
      { status: 500 },
    );
  }
}
