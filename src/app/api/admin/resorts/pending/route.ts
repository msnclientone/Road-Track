import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pending = await prisma.resort.findMany({
      where: { status: "PENDING" },
      include: { owner: { select: { id: true, email: true, name: true, phone: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, resorts: pending });
  } catch (err) {
    console.error("pending resorts failed:", err);
    return NextResponse.json({ error: "Unable to fetch pending resorts" }, { status: 500 });
  }
}
