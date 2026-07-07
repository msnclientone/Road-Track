import { prisma } from "@/lib/prisma";

export async function generateBookingId(): Promise<string> {
  const lastBooking = await prisma.tripBooking.findFirst({
    orderBy: { createdAt: "desc" },
    select: { bookingId: true },
  });

  let nextNum = 1;
  if (lastBooking?.bookingId) {
    const match = lastBooking.bookingId.match(/ROADB(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `ROADB${String(nextNum).padStart(6, "0")}`;
}
