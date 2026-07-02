"use client";

import { MapPinned } from "lucide-react";

export default function ViewLocationButton({ href }: { href: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.open(href, "_blank", "noreferrer");
      }}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-bold text-coral transition hover:bg-coral hover:text-ink"
    >
      <MapPinned className="h-4 w-4" />
      View Location
    </button>
  );
}