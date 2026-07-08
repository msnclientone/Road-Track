import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.tripBooking.updateMany({
      where: { enquiryId: id },
      data: { enquiryId: null },
    });

    await prisma.enquiry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete enquiry", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry." },
      { status: 500 },
    );
  }
}
