import { NextResponse } from "next/server";
import { autoCompleteExpiredBookings } from "@/lib/booking-inventory";

export async function GET() {
  try {
    const count = await autoCompleteExpiredBookings();
    return NextResponse.json({ completed: count });
  } catch (error) {
    console.error("Auto-complete failed", error);
    return NextResponse.json(
      { error: "Auto-complete failed." },
      { status: 500 },
    );
  }
}
