import { NextResponse } from "next/server";

import { getRedirectForUser } from "@/lib/auth/login-config";
import { hashPassword } from "@/lib/auth/password";
import {
  clearSignupCookie,
  createSessionToken,
  getSignupSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const signupSession = await getSignupSession();

    if (!signupSession) {
      return NextResponse.json(
        { error: "Sign up session expired. Verify your email again." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid registration details." },
        { status: 400 },
      );
    }

    const email = signupSession.email;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.passwordHash) {
      await clearSignupCookie();
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            passwordHash,
            termsAcceptedAt: new Date(),
            emailVerifiedAt: new Date(),
            role: "CUSTOMER",
          },
        })
      : await prisma.user.create({
          data: {
            email,
            name: parsed.data.name,
            phone: parsed.data.phone,
            passwordHash,
            termsAcceptedAt: new Date(),
            emailVerifiedAt: new Date(),
            role: "CUSTOMER",
          },
        });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerStatus: user.partnerStatus,
    });

    await clearSignupCookie();
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: getRedirectForUser("customer", user.partnerStatus),
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Unable to complete registration right now." },
      { status: 500 },
    );
  }
}
