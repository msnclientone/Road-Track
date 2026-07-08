import { NextRequest, NextResponse } from "next/server";

import { leads } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validation";
import { generateBookingId } from "@/lib/booking-id";
import { getSession } from "@/lib/auth/session";
import { getAvailableRooms } from "@/lib/booking-availability";

function isAcRoom(roomType: string | null): boolean {
  if (!roomType) return false;
  return /^(AC|A\/C|AIR CONDITIONED)$/i.test(roomType);
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

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
  const travelDate = data.date ? parseDate(data.date) : null;

  try {
    const checkIn = parseDate(data.tripCheckIn);
    const checkOut = parseDate(data.tripCheckOut);
    const vehicleId = data.tripVehicleId as string | undefined;
    const resortId = data.tripResortId as string | undefined;
    const roomType = data.tripRoomType as string | undefined;
    const acRooms = data.tripAcRoomsRequired != null ? Number(data.tripAcRoomsRequired) : 1;
    const nonAcRooms = data.tripNonAcRoomsRequired != null ? Number(data.tripNonAcRoomsRequired) : 0;

    /* ── Vehicle availability check ── */
    if (vehicleId && checkIn && checkOut) {
      const overlapping = await prisma.tripBooking.findFirst({
        where: {
          selectedVehicleId: vehicleId,
          status: "CONFIRMED",
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
      });

      if (overlapping) {
        return NextResponse.json(
          {
            error: `This vehicle is already booked from ${overlapping.checkIn?.toLocaleString("en-IN") ?? "—"} to ${overlapping.checkOut?.toLocaleString("en-IN") ?? "—"}. Please choose another vehicle.`,
          },
          { status: 409 },
        );
      }
    }

    /* ── Resort room availability check (dynamic) ── */
    if (resortId && checkIn && checkOut && roomType) {
      const available = await getAvailableRooms(resortId, checkIn, checkOut);
      const ac = isAcRoom(roomType);
      const required = ac ? acRooms : nonAcRooms;
      const avail = ac ? available.ac : available.nonAc;

      if (required > 0 && avail < required) {
        const label = ac ? "AC" : "Non-AC";
        return NextResponse.json(
          {
            error: `Selected room type (${label}) is not available for these dates. Only ${avail} room(s) remaining, but ${required} requested.`,
          },
          { status: 409 },
        );
      }
    }

    /* ── Create enquiry ── */
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
        travelDate,
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

    /* ── Create TripBooking ── */
    await prisma.tripBooking.create({
      data: {
        bookingId,
        customerName: data.name as string,
        customerPhone: data.phone as string,
        destinationName: data.tripDestination as string | undefined,
        checkIn,
        checkOut,
        numDays: data.tripDays != null ? Number(data.tripDays) : null,
        numNights: data.tripNights != null ? Number(data.tripNights) : null,
        numPeople: data.people as number,
        selectedResortId: resortId,
        selectedVehicleId: vehicleId,
        vehicleRegNo: data.tripVehicleRegNo as string | undefined,
        vehicleOwnerId: data.tripVehicleOwnerId as string | undefined,
        resortOwnerId: data.tripResortOwnerId as string | undefined,
        pricingMode: data.tripPricingMode as string | undefined,
        distance: data.tripDistance as string | undefined,
        roomType,
        acRoomsRequired: acRooms,
        nonAcRoomsRequired: nonAcRooms,
        vehicleCost: data.tripVehicleCost != null ? Number(data.tripVehicleCost) : null,
        resortCost: data.tripResortCost != null ? Number(data.tripResortCost) : null,
        totalCost: data.tripTotalCost != null ? Number(data.tripTotalCost) : null,
        perHeadCost: data.tripPerHeadCost != null ? Number(data.tripPerHeadCost) : null,
        status: "NEW",
        enquiryId: enquiry.id,
      },
    });

    /* ── Clear bucket after successful booking ── */
    const session = await getSession();
    if (session?.role === "CUSTOMER") {
      const bucket = await prisma.bucket.findFirst({
        where: { customerId: session.sub },
      });
      if (bucket) {
        await prisma.bucketItem.deleteMany({
          where: { bucketId: bucket.id },
        });
      }
    }

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
