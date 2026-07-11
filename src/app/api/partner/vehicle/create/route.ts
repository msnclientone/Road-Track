import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { vehicleCreateSchema } from "@/lib/auth/validation";
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
    const parsed = vehicleCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      vehicleType,
      seatingCapacity,
      driverName,
      driverPhone,
      registrationNo,
      destinationId,
    } = parsed.data;

    const vehicle = await prisma.vehicle.create({
      data: {
        owner: { connect: { id: session.sub } },

        vehicleType,

        seatingCapacity: Number(seatingCapacity),

        // Super Admin will set these during approval
        pricePerKm: null,
        pricePerDay: null,

        driverName,

        driverPhone,

        registrationNo:
          registrationNo?.toUpperCase() || null,

        destination: destinationId ? { connect: { id: destinationId } } : undefined,

        status: "PENDING",
      },
      include: {
        destination: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Vehicle submitted successfully. Waiting for Super Admin approval.",
      vehicle,
    });
  } catch (err) {
    console.error("Create Vehicle Error:", err);

    return NextResponse.json(
      {
        error: "Unable to create vehicle.",
      },
      {
        status: 500,
      }
    );
  }
}