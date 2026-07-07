import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const where = search
      ? { bookingId: { contains: search, mode: "insensitive" as const } }
      : {};

    const bookings = await prisma.tripBooking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        selectedResort: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            priceMin: true,
            priceMax: true,
            destination: {
              select: { name: true },
            },
            owner: {
              select: {
                name: true,
                phone: true,
                email: true,
                resortOwnerId: true,
              },
            },
          },
        },
        selectedVehicle: {
          select: {
            id: true,
            vehicleType: true,
            registrationNo: true,
            ownerId: true,
            pricePerDay: true,
            pricePerKm: true,
            minimumPrice: true,
            minimumKm: true,
            destination: {
              select: { name: true },
            },
            owner: {
              select: {
                name: true,
                phone: true,
                email: true,
                vehicleOwnerId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 },
    );
  }
}
