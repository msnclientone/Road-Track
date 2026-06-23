import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "VEHICLE_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      vehicleType,
      seatingCapacity,
      pricePerKm,
      pricePerDay,
      driverName,
      driverPhone,
      registrationNo,
      destinationId,
    } = body as any;

    if (!vehicleType || !seatingCapacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: session.sub,
        vehicleType,
        seatingCapacity: Number(seatingCapacity),
        pricePerKm: pricePerKm ? Number(pricePerKm) : null,
        pricePerDay: pricePerDay ? Number(pricePerDay) : null,
        driverName: driverName ?? null,
        driverPhone: driverPhone ?? null,
        registrationNo: registrationNo ?? null,
        destinationId: destinationId ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, vehicle });
  } catch (err) {
    console.error("create vehicle failed:", err);
    return NextResponse.json({ error: "Unable to create vehicle" }, { status: 500 });
  }
}
