import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEnquiryId } from "@/lib/generate-id";
import { INDIAN_PHONE_REGEX } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, vehicleId } = body;

    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Customer phone is required." }, { status: 400 });
    }
    const digits = customerPhone.replace(/\D/g, "");
    if (!INDIAN_PHONE_REGEX.test(digits)) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number." }, { status: 400 });
    }
    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID is required." }, { status: 400 });
    }

    const enquiryId = await generateEnquiryId();

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        assignedVehicleId: vehicleId,
        vehicleRequired: true,
        source: "WHATSAPP",
        status: "NEW",
      },
    });

    return NextResponse.json({ enquiryId: enquiry.enquiryId }, { status: 201 });
  } catch (error) {
    console.error("Vehicle enquiry failed:", error);
    return NextResponse.json({ error: "Unable to submit enquiry." }, { status: 500 });
  }
}
