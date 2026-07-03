import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pending = await prisma.vehicle.findMany({
      where: { status: "PENDING" },
      include: {
        owner: { select: { id: true, email: true, name: true, phone: true } },
        destination: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, vehicles: pending });
  } catch (err) {
    console.error("pending vehicles failed:", err);
    return NextResponse.json({ error: "Unable to fetch pending vehicles" }, { status: 500 });
  }
}
