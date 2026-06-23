import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status } = body as { userId?: string; status?: string };

    if (!userId || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { partnerStatus: status as any },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("update partner status failed:", err);
    return NextResponse.json({ error: "Unable to update status" }, { status: 500 });
  }
}
