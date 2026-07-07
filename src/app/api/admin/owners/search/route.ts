import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ owners: [] });
    }

    const owners = await prisma.user.findMany({
      where: {
        role: { in: ["RESORT_OWNER", "VEHICLE_OWNER"] },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { vehicleOwnerId: { contains: q, mode: "insensitive" } },
          { resortOwnerId: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        _count: {
          select: { vehicles: true, resorts: true },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ owners });
  } catch (error) {
    console.error("Owner search failed:", error);
    return NextResponse.json({ error: "Unable to search owners." }, { status: 500 });
  }
}
