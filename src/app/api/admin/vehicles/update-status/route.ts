import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      vehicleId,
      status,
      pricePerDay,
      pricePerKm,
      availability,
    } = body;

    if (!vehicleId || !status) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const validStatus = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "SUSPENDED",
    ];

    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "APPROVED") {
      if (
        pricePerDay === undefined ||
        pricePerKm === undefined
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter both Price Per Day and Price Per KM before approving.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        Number(pricePerDay) <= 0 ||
        Number(pricePerKm) <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Prices must be greater than zero.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.pricePerDay = Number(pricePerDay);
      updateData.pricePerKm = Number(pricePerKm);

      updateData.availability =
        availability ?? "AVAILABLE";
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      message: "Vehicle updated successfully.",
      vehicle,
    });
  } catch (error) {
    console.error("Vehicle Approval Error:", error);

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