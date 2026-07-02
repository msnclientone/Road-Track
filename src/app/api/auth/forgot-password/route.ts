import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import {
  generateResetToken,
  hashResetToken,
  getResetTokenExpiry,
} from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/auth/email";

const RATE_LIMIT_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: firstError.email?.[0] ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (user) {
      const recent = await prisma.passwordResetToken.findFirst({
        where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });

      if (!recent) {
        const token = generateResetToken();
        const tokenHash = hashResetToken(token);

        await prisma.passwordResetToken.create({
          data: {
            email,
            tokenHash,
            expiresAt: getResetTokenExpiry(),
          },
        });

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        const resetLink = `${siteUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail({ to: email, resetLink });
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("forgot-password failed:", err);
    return NextResponse.json(
      { error: "Unable to process request. Please try again later." },
      { status: 500 },
    );
  }
}
