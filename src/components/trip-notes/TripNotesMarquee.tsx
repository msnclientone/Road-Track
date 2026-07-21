"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import TripNoteCard from "./TripNoteCard";

interface TripNote {
  id: string;
  title: string;
  description: string | null;
  price: number;
  totalKm: number;
  imageUrl: string;
}

export default function TripNotesMarquee({ notes }: { notes: TripNote[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.currentTarget as HTMLElement).querySelector<HTMLElement>("a")?.focus();
    }
  }, []);

  if (notes.length === 0) return null;

  const doubled = [...notes, ...notes];

  return (
    <div
      className="group/marquee relative overflow-hidden"
      role="region"
      aria-label="Trip Notes"
      onKeyDown={handleKeyDown}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ivory to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ivory to-transparent" />

      <div
        ref={trackRef}
        className={`trip-notes-marquee-track flex w-max gap-4 py-3 ${
          prefersReduced ? "" : ""
        }`}
        style={
          prefersReduced
            ? { animation: "none" }
            : undefined
        }
      >
        {doubled.map((note, i) => (
          <TripNoteCard key={`${note.id}-${i}`} note={note} />
        ))}
      </div>
    </div>
  );
}
