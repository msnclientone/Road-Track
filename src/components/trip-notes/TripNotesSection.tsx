"use client";

import { useEffect, useState } from "react";
import TripNotesMarquee from "./TripNotesMarquee";

interface TripNote {
  id: string;
  title: string;
  description: string | null;
  price: number;
  totalKm: number;
  imageUrl: string;
}

export default function TripNotesSection() {
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trip-notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || notes.length === 0) return null;

  return (
    <section className="mx-auto max-w-none px-5 py-10 max-md:py-8 sm:px-8 lg:px-10 2xl:px-12">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
          Trip Notes
        </p>
        <h2 className="mt-3 text-3xl max-md:text-2xl font-black tracking-tight sm:text-4xl">
          Quick trips starting from just ₹99
        </h2>
      </div>
      <TripNotesMarquee notes={notes} />
    </section>
  );
}
