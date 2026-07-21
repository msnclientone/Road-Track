"use client";

import Image from "next/image";
import { memo } from "react";
import { formatCurrency, buildWhatsAppUrl } from "@/lib/utils";

interface TripNote {
  id: string;
  title: string;
  description: string | null;
  price: number;
  totalKm: number;
  imageUrl: string;
}

function buildTripNoteMessage(note: TripNote) {
  return [
    "Hello Road Track,",
    "",
    "I am interested in the following Trip Note.",
    "",
    `Trip: ${note.title}`,
    `Price: ${formatCurrency(note.price)}`,
    `Distance: ${note.totalKm} KM`,
    "",
    "Please share the complete itinerary and details of this trip.",
    "",
    "Thank you.",
  ].join("\n");
}

function TripNoteCardInner({ note }: { note: TripNote }) {
  return (
    <a
      href={buildWhatsAppUrl(buildTripNoteMessage(note))}
      target="_blank"
      rel="noreferrer"
      className="group flex shrink-0 items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      aria-label={`Contact Road Track about ${note.title} for ${formatCurrency(note.price)}`}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <Image
          src={note.imageUrl}
          alt={note.title}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black leading-tight text-ink">
          {note.title}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs font-bold text-stone">
          <span className="text-coral">{formatCurrency(note.price)}</span>
          <span>{note.totalKm} KM</span>
        </span>
      </div>
    </a>
  );
}

const TripNoteCard = memo(TripNoteCardInner);
export default TripNoteCard;
