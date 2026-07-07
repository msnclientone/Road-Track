import { NextRequest, NextResponse } from "next/server";

import { leads } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validation";
import { generateBookingId } from "@/lib/booking-id";

export async function GET() {
  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const result = enquirySchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Invalid enquiry details." },
      { status: 422 },
    );
  }

  const data = result.data as Record<string, unknown>;
  const travelDate = data.date ? new Date(data.date as string) : null;
  const validTravelDate =
    travelDate && Number.isNaN(travelDate.getTime()) ? null : travelDate;

  try {
    const destination = data.destinationSlug
      ? await prisma.destination.findUnique({
          where: { slug: data.destinationSlug as string },
          select: { id: true },
        })
      : null;

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: data.name as string,
        customerPhone: data.phone as string,
        customerEmail: data.email as string | undefined,
        destinationId: destination?.id,
        travelDate: validTravelDate,
        numPeople: data.people as number,
        vehicleRequired: data.vehicleRequired as boolean,
        resortRequired: data.resortRequired as boolean,
        message:
          (data.message as string) ??
          [
            data.destination as string,
            data.vehicle ? `Vehicle preference: ${data.vehicle}` : "",
            data.hotel ? `Resort preference: ${data.hotel}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        source: "WEBSITE",
        status: "NEW",
      },
    });

    const bookingId = await generateBookingId();

    let checkInDate: Date | null = null;
    let checkOutDate: Date | null = null;

    if (data.tripCheckIn) {
      const d = new Date(data.tripCheckIn as string);
      if (!Number.isNaN(d.getTime())) checkInDate = d;
    }
    if (data.tripCheckOut) {
      const d = new Date(data.tripCheckOut as string);
      if (!Number.isNaN(d.getTime())) checkOutDate = d;
    }

    await prisma.tripBooking.create({
      data: {
        bookingId,
        customerName: data.name as string,
        customerPhone: data.phone as string,
        destinationName: data.tripDestination as string | undefined,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        numDays: data.tripDays != null ? Number(data.tripDays) : null,
        numNights: data.tripNights != null ? Number(data.tripNights) : null,
        numPeople: data.people as number,
        selectedResortId: data.tripResortId as string | undefined,
        selectedVehicleId: data.tripVehicleId as string | undefined,
        vehicleRegNo: data.tripVehicleRegNo as string | undefined,
        vehicleOwnerId: data.tripVehicleOwnerId as string | undefined,
        resortOwnerId: data.tripResortOwnerId as string | undefined,
        pricingMode: data.tripPricingMode as string | undefined,
        distance: data.tripDistance as string | undefined,
        roomType: data.tripRoomType as string | undefined,
        vehicleCost: data.tripVehicleCost != null ? Number(data.tripVehicleCost) : null,
        resortCost: data.tripResortCost != null ? Number(data.tripResortCost) : null,
        totalCost: data.tripTotalCost != null ? Number(data.tripTotalCost) : null,
        perHeadCost: data.tripPerHeadCost != null ? Number(data.tripPerHeadCost) : null,
        status: "NEW",
        enquiryId: enquiry.id,
      },
    });

    return NextResponse.json(
      {
        leadId: enquiry.id,
        bookingId,
        status: "New",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Enquiry persistence failed", error);
    return NextResponse.json(
      {
        error:
          "Enquiry could not be saved. Connect PostgreSQL before opening WhatsApp.",
      },
      { status: 503 },
    );
  }
}
