import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
  resortId,
  status,
  nonAcPrice,
  acPrice,
} = body as {
  resortId?: string;
  status?: string;
  nonAcPrice?: number;
  acPrice?: number;
};

    if (!resortId || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {
  status,
};

if (status === "APPROVED") {
  if (
    nonAcPrice === undefined ||
    acPrice === undefined
  ) {
    return NextResponse.json(
      {
        error: "Please enter both AC and Non AC prices.",
      },
      {
        status: 400,
      }
    );
  }

  updateData.priceMin = Number(nonAcPrice);
  updateData.priceMax = Number(acPrice);
}

const resort = await prisma.resort.update({
  where: {
    id: resortId,
  },
  data: updateData,
});

    return NextResponse.json({ ok: true, resort });
  } catch (err) {
    console.error("update resort status failed:", err);
    return NextResponse.json({ error: "Unable to update status" }, { status: 500 });
  }
}
