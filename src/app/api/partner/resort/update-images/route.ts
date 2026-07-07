import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { convertToDirectImageUrl, isGoogleDriveUrl, isValidImageUrl } from "@/lib/placeholders";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "RESORT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { resortId, imageUrls } = await request.json();

    if (!resortId) {
      return NextResponse.json({ error: "Resort not found." }, { status: 400 });
    }

    if (!Array.isArray(imageUrls)) {
      return NextResponse.json({ error: "imageUrls must be an array." }, { status: 400 });
    }

    const resort = await prisma.resort.findFirst({
      where: { id: resortId, ownerId: session.sub },
    });

    if (!resort) {
      return NextResponse.json({ error: "Resort not found." }, { status: 404 });
    }

    const resolvedUrls = imageUrls
      .filter((url: string) => typeof url === "string" && url.trim() !== "")
      .map((url: string) => {
        const resolved = isGoogleDriveUrl(url) ? convertToDirectImageUrl(url) : url;
        if (!isValidImageUrl(resolved)) return null;
        return resolved;
      })
      .filter(Boolean) as string[];

    await prisma.$transaction(async (tx) => {
      await tx.resortMedia.deleteMany({ where: { resortId } });
      if (resolvedUrls.length > 0) {
        await tx.resortMedia.createMany({
          data: resolvedUrls.map((url, index) => ({
            resortId,
            url,
            type: "PHOTO",
            order: index,
          })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update images failed:", err);
    return NextResponse.json({ error: "Unable to update images." }, { status: 500 });
  }
}
