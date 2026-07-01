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
      },
    });

    return NextResponse.json({
      ok: true,
      vehicle: updated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to update price.",
      },
      {
        status: 500,
      }
    );
  }
}