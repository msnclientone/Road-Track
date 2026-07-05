import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { vehicleUpdateSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VEHICLE_OWNER") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = vehicleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      id,
      vehicleType,
      seatingCapacity,
      driverName,
      driverPhone,
      registrationNo,
      destinationId,
    } = { ...parsed.data, id: body.id };

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle not found." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        vehicleType,
        seatingCapacity: Number(seatingCapacity),
        driverName,
        driverPhone,
        registrationNo:
          registrationNo?.toUpperCase(),
        destinationId: destinationId || null,
      },
      include: {
        destination: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      vehicle,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to update vehicle.",
      },
      {
        status: 500,
      }
    );
  }
}