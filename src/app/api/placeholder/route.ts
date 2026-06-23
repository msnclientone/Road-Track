import { NextResponse } from "next/server";

import { getPlaceholderImageUrl } from "@/lib/placeholders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "default";
  const imageUrl = getPlaceholderImageUrl(type);

  try {
    const response = await fetch(imageUrl, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to load placeholder image." },
        { status: 502 },
      );
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("Placeholder image fetch failed:", error);
    return NextResponse.json(
      { error: "Unable to load placeholder image." },
      { status: 502 },
    );
  }
}
