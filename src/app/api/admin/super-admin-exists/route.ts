import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    return NextResponse.json({ exists: count > 0 });
  } catch (err) {
    console.error("super-admin-exists check failed:", err);
    return NextResponse.json({ exists: true });
  }
}
