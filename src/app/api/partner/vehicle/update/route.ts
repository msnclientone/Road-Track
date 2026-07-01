import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
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

    const {
      id,
      vehicleType,
      seatingCapacity,
      driverName,
      driverPhone,
      registrationNo,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle not found." },
        { status: 400 }
      );
    }

    if (
      driverPhone &&
      !/^[0-9]{10}$/.test(driverPhone)
    ) {
      return NextResponse.json(
        {
          error:
            "Driver phone must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    if (
      registrationNo &&
      !/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(
        registrationNo.toUpperCase()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Registration number is invalid.",
        },
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
          registrationNo.toUpperCase(),
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