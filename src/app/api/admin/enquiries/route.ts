import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const where = search
      ? { enquiryId: { contains: search, mode: "insensitive" as const } }
      : {};

    const enquiries = await prisma.enquiry.findMany({
      where: {
        ...where,
        // Only standalone enquiries (not linked to a TripBooking)
        tripBooking: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignedVehicle: {
          select: {
            id: true,
            vehicleType: true,
            registrationNo: true,
            destination: { select: { name: true } },
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
        assignedResort: {
          select: {
            id: true,
            name: true,
            destination: { select: { name: true } },
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
      },
      take: 50,
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Failed to fetch enquiries", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries." },
      { status: 500 },
    );
  }
}
