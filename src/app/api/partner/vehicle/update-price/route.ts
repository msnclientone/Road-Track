import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VEHICLE_OWNER") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      vehicleId,
      pricePerDay,
      pricePerKm,
      minimumPrice,
      minimumKm,
    } = await request.json();

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle not found." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ownerId: session.sub,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        pricePerDay: Number(pricePerDay),
        pricePerKm: Number(pricePerKm),
        minimumPrice: minimumPrice != null ? Number(minimumPrice) : null,
        minimumKm: minimumKm != null ? Number(minimumKm) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      vehicle: updated,
    });
  } catch (err) {
    console.error("update-price error:", err);

    const message =
      err instanceof Error ? err.message : "Unable to update price.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}