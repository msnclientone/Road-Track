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
}: {
  destinations: Destination[];
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
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-16 w-full items-center justify-between rounded-2xl bg-white px-6 shadow-xl transition hover:shadow-2xl"
      >
        <div className="flex items-center gap-4">

          <Search className="h-6 w-6 text-stone" />

          <span
            className={
              query
                ? "text-lg font-semibold text-ink"
                : "text-lg text-stone"
            }
          >
            {query || "Search or Select Destination"}
          </span>

        </div>

        <ChevronDown
          className={`h-6 w-6 text-stone transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
            {open && (
        <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border bg-white shadow-2xl">

          <div className="border-b p-4">

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type destination..."
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-coral"
            />

          </div>

          <div className="max-h-80 overflow-y-auto">

            {filtered.length === 0 && (

              <div className="p-5 text-center text-stone">

                No destination found

              </div>

            )}

            {filtered.map((destination) => (

              <button
                key={destination.id}
                type="button"
                onClick={() => selectDestination(destination)}
                className="flex w-full items-center gap-4 border-b px-5 py-4 text-left transition hover:bg-ivory"
              >

                <MapPin className="h-5 w-5 text-coral" />

                <span className="text-lg font-semibold text-ink">
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