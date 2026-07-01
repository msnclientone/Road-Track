import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

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