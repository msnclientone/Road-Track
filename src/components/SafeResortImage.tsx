"use client";

import { useState } from "react";
import Image from "next/image";
import { getListingImageUrl, PLACEHOLDER_IMAGES } from "@/lib/placeholders";
import NoImagePlaceholder from "./NoImagePlaceholder";

type Props = {
  media: { url: string }[] | undefined | null;
  name: string;
  priority?: boolean;
};

export default function SafeResortImage({ media, name, priority }: Props) {
  const safeUrl = getListingImageUrl(media, "resort");
  const [imgSrc, setImgSrc] = useState(safeUrl);
  const [showPlaceholder, setShowPlaceholder] = useState(safeUrl === PLACEHOLDER_IMAGES.resort);

  if (showPlaceholder) {
    return <NoImagePlaceholder />;
  }

  return (
    <Image
      src={imgSrc}
      alt={name}
      fill
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      className="object-cover"
      sizes="(min-width: 1024px) 66vw, 100vw"
      onError={() => setShowPlaceholder(true)}
    />
  );
}
