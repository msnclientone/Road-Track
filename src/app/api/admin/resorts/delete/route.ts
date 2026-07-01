import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { resortId } = await request.json();

    if (!resortId) {
      return NextResponse.json(
        { error: "Resort not found." },
        { status: 400 }
      );
    }

    await prisma.resort.delete({
      where: {
        id: resortId,
      },
    });

    return NextResponse.json({
      ok: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to delete resort.",
      },
      {
        status: 500,
      }
    );
  }
}