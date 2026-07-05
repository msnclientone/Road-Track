import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { validatePhone } from "@/lib/phone";

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (body.phone) {
    const phoneError = validatePhone(body.phone);
    if (phoneError) {
      return NextResponse.json(
        { error: phoneError },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: {
      id: session.sub,
    },
    data: {
      name: body.name,
      phone: body.phone,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}