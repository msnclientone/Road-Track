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
      vehicleType,
      seatingCapacity,
      driverName,
      driverPhone,
      registrationNo,
      destinationId,
    } = body;

    if (!vehicleType || !seatingCapacity) {
      return NextResponse.json(
        {
          error: "Vehicle Type and Seating Capacity are required.",
        },
        { status: 400 }
      );
    }

    // Driver Phone Validation
    if (
      driverPhone &&
      !/^[0-9]{10}$/.test(driverPhone)
    ) {
      return NextResponse.json(
        {
          error:
            "Driver phone number must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    // Registration Number Validation
    if (
      registrationNo &&
      !/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(
        registrationNo.toUpperCase()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Registration number must be in Indian format (Example: KA19AB1234).",
        },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: session.sub,

        vehicleType,

        seatingCapacity: Number(seatingCapacity),

        // Super Admin will set these during approval
        pricePerKm: null,
        pricePerDay: null,

        driverName: driverName || null,

        driverPhone: driverPhone || null,

        registrationNo:
          registrationNo?.toUpperCase() || null,

        destinationId: destinationId || null,

        status: "PENDING",
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