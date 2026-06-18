import { NextRequest, NextResponse } from "next/server";
import { AvailabilityStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { identifier, availability, pricePerDay } = payload as {
    identifier?: string;
    availability?: string;
    pricePerDay?: number;
  };

  if (!identifier || !availability) {
    return NextResponse.json({ error: "Missing fields" }, { status: 422 });
  }

  if (!Object.values(AvailabilityStatus).includes(availability as AvailabilityStatus)) {
    return NextResponse.json(
      { error: "Invalid availability status" },
      { status: 422 },
    );
  }

  try {
    // Try find by id first, then registrationNo
    let vehicle = await prisma.vehicle.findUnique({ where: { id: identifier } });

    if (!vehicle) {
      vehicle = await prisma.vehicle.findFirst({ where: { registrationNo: identifier } });
    }

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const data: Prisma.VehicleUpdateInput = {
      availability: availability as AvailabilityStatus,
    };

    if (typeof pricePerDay === "number" && !Number.isNaN(pricePerDay)) {
      data.pricePerDay = pricePerDay;
    }

    const updated = await prisma.vehicle.update({ where: { id: vehicle.id }, data });

    return NextResponse.json({ success: true, vehicle: { id: updated.id, availability: updated.availability, pricePerDay: updated.pricePerDay } }, { status: 200 });
  } catch (error) {
    console.error("Vehicle update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
