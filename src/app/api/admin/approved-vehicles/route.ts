import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        id: true,
        vehicleType: true,
        registrationNo: true,
        seatingCapacity: true,
        driverName: true,
        driverPhone: true,
        pricePerDay: true,
        pricePerKm: true,
        availability: true,
        status: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, vehicles });
  } catch (err) {
    console.error("list approved vehicles failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Unable to list vehicles", detail: message }, { status: 500 });
  }
}
