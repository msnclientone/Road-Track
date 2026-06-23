import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, getSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid details." },
        { status: 400 },
      );
    }

    const existingSuperAdmin = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });

    // If a super admin already exists, require the requester to be an authenticated super admin
    if (existingSuperAdmin > 0) {
      const session = await getSession();
      if (!session || session.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const userEmail = body.email?.toString?.().trim?.();

    // basic existing user check by email
    const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
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
            role: "SUPER_ADMIN",
          },
        })
      : await prisma.user.create({
          data: {
            email: userEmail,
            name: parsed.data.name,
            phone: parsed.data.phone,
            passwordHash,
            termsAcceptedAt: new Date(),
            emailVerifiedAt: new Date(),
            role: "SUPER_ADMIN",
          },
        });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerStatus: user.partnerStatus,
    });

    await setSessionCookie(token);

    return NextResponse.json({ ok: true, redirectTo: "/admin" });
  } catch (error) {
    console.error("Create super admin failed:", error);
    return NextResponse.json({ error: "Unable to create super admin." }, { status: 500 });
  }
}
