import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const where = search
      ? {
          enquiryId: { contains: search, not: null },
          tripBooking: null,
        }
      : { tripBooking: null };

    const enquiries = await prisma.enquiry.findMany({
      where,
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
