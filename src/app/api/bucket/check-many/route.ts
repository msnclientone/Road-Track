import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json({ vehicleIds: [], resortIds: [] });
    }

    const bucket = await prisma.bucket.findFirst({
      where: { customerId: session.sub },
      select: {
        items: {
          select: {
            resortId: true,
            vehicleId: true,
          },
        },
      },
    });

    const vehicleIds: string[] = [];
    const resortIds: string[] = [];

    for (const item of bucket?.items ?? []) {
      if (item.resortId) resortIds.push(item.resortId);
      if (item.vehicleId) vehicleIds.push(item.vehicleId);
    }

    return NextResponse.json({ vehicleIds, resortIds });
  } catch {
    return NextResponse.json({ vehicleIds: [], resortIds: [] });
  }
}
