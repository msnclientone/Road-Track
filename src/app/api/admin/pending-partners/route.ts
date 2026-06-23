import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        role: { in: ["RESORT_OWNER", "VEHICLE_OWNER"] },
        partnerStatus: "PENDING",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        partnerStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, users: pendingUsers });
  } catch (err) {
    console.error("pending-partners failed:", err);
    return NextResponse.json({ error: "Unable to fetch pending partners" }, { status: 500 });
  }
}
