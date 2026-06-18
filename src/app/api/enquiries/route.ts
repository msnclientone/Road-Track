import { NextRequest, NextResponse } from "next/server";

import { leads } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/validation";

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

  const data = result.data;
  const travelDate = data.date ? new Date(data.date) : null;
  const validTravelDate =
    travelDate && Number.isNaN(travelDate.getTime()) ? null : travelDate;

  try {
    const destination = data.destinationSlug
      ? await prisma.destination.findUnique({
          where: { slug: data.destinationSlug },
          select: { id: true },
        })
      : null;

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
        destinationId: destination?.id,
        travelDate: validTravelDate,
        numPeople: data.people,
        vehicleRequired: data.vehicleRequired,
        resortRequired: data.resortRequired,
        message:
          data.message ??
          [
            data.destination,
            data.vehicle ? `Vehicle preference: ${data.vehicle}` : "",
            data.hotel ? `Resort preference: ${data.hotel}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        source: "WEBSITE",
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        leadId: enquiry.id,
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
