import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { clearSessionCookie, getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.sub,
    },
    select: {
      name: true,
    },
  });

  return NextResponse.json({
    user: {
      ...session,
      name: user?.name,
    },
  });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
