"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

type Destination = {
  id: string;
  name: string;
  slug: string;
};

export default function DestinationSearch({
  destinations,
  navbar = false,
}: {
  destinations: Destination[];
  navbar?: boolean;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return destinations.filter((destination) =>
      destination.name
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, destinations]);

  function selectDestination(destination: Destination) {
    setOpen(false);
    setQuery(destination.name);

    router.push(`/destinations/${destination.slug}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center justify-between transition hover:shadow-2xl ${
          navbar
            ? "h-10 gap-2 rounded-lg bg-white/15 px-3 text-sm text-white/85 shadow-md hover:bg-white/25"
            : "flex h-16 w-full items-center justify-between rounded-2xl bg-white px-6 shadow-xl hover:shadow-2xl"
        }`}
      >
        <div className="flex items-center gap-2">
          <Search className={navbar ? "h-4 w-4" : "h-6 w-6 text-stone"} />

          <span
            className={
              query
                ? navbar
                  ? "font-semibold text-white"
                  : "text-lg font-semibold text-ink"
                : navbar
                  ? "text-white/70"
                  : "text-lg text-stone"
            }
          >
            {query || "Search"}
          </span>
        </div>

        <ChevronDown
          className={`text-stone transition ${
            navbar ? "h-3 w-3" : "h-6 w-6"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={`absolute z-50 overflow-hidden border bg-white shadow-2xl ${
            navbar
              ? "right-0 mt-2 w-72 rounded-xl"
              : "mt-3 w-full rounded-2xl"
          }`}
        >
          <div className="border-b p-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type destination..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-coral"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-stone">
                No destination found
              </div>
            )}

            {filtered.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => selectDestination(destination)}
                className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-sm transition hover:bg-ivory"
              >
                <MapPin className="h-4 w-4 shrink-0 text-coral" />
                <span className="font-semibold text-ink">
                  {destination.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}