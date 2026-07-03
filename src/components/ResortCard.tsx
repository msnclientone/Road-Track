"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPinned } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getListingImageUrl } from "@/lib/placeholders";

type ResortData = {
  id: string;
  name: string;
  address: string | null;
  description: string;
  priceMin: number;
  amenities: string[];
  googleMapsLink?: string | null;
  media?: { url: string; type?: string; order: number }[];
};

type Props = {
  resort: ResortData;
  index?: number;
  showRemoveButton?: boolean;
  itemId?: string;
  onRemove?: (itemId: string) => void;
};

export default function ResortCard({
  resort,
  index = 0,
  showRemoveButton,
  itemId,
  onRemove,
}: Props) {
  return (
    <Link
      href={`/resort/${resort.id}`}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] transition hover:-translate-y-1 hover:shadow-lg"
    >
      <article className="flex h-full flex-col text-ivory">
        <div className="relative aspect-[16/10]">
          <Image
            src={getListingImageUrl(resort.media, "resort")}
            alt={resort.name}
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">{resort.name}</h3>
              {resort.address && (
                <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <MapPinned className="h-4 w-4 text-coral" />
                  {resort.address}
                </p>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm text-white/70 line-clamp-2">
            {resort.description}
          </p>

          {resort.amenities && resort.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {resort.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-white/75"
                >
                  {amenity}
                </span>
              ))}
              {resort.amenities.length > 3 && (
                <span className="text-xs font-bold text-white/75">
                  +{resort.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mt-auto">
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Starting from</p>
                <p className="text-xl font-black">
                  {formatCurrency(resort.priceMin)}
                </p>
              </div>
            </div>

            {resort.googleMapsLink && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(resort.googleMapsLink!, "_blank", "noreferrer");
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white hover:text-ink"
              >
                <MapPinned className="h-4 w-4" />
                View Location
              </button>
            )}

            {showRemoveButton && itemId && onRemove && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(itemId);
                }}
                className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
