import { NextRequest, NextResponse } from "next/server";
import { getAvailableRooms, hasOverlappingVehicleBooking } from "@/lib/booking-availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get("resortId");
  const vehicleId = searchParams.get("vehicleId");
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");

  if (!checkInStr || !checkOutStr) {
    return NextResponse.json(
      { error: "checkIn and checkOut are required." },
      { status: 400 },
    );
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format." },
      { status: 400 },
    );
  }

  let resort = null;
  let vehicle = null;

  if (resortId) {
    const rooms = await getAvailableRooms(resortId, checkIn, checkOut);
    resort = { ac: rooms.ac, nonAc: rooms.nonAc };
  }

  if (vehicleId) {
    const isBooked = await hasOverlappingVehicleBooking(vehicleId, checkIn, checkOut);
    vehicle = { isBooked };
  }

  return NextResponse.json({ resort, vehicle });
}
