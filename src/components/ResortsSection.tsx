"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import ResortCard from "@/components/ResortCard";

type Resort = {
  id: string;
  name: string;
  address: string | null;
  description: string;
  priceMin: number;
  priceMax: number;
  availableAcRooms: number;
  availableNonAcRooms: number;
  amenities: string[];
  googleMapsLink?: string | null;
  media?: { url: string; type: string; order: number }[];
  destination: {
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt: string;
};

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low \u2192 High", value: "price-asc" },
  { label: "Price: High \u2192 Low", value: "price-desc" },
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Most Available Rooms", value: "rooms-desc" },
  { label: "Least Available Rooms", value: "rooms-asc" },
  { label: "Newest First", value: "newest" },
];

const PRICE_OPTIONS = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: `Below \u20B91,000/night`, min: 0, max: 999 },
  { label: `\u20B91,000\u2013\u20B93,000/night`, min: 1000, max: 3000 },
  { label: `\u20B93,000\u2013\u20B95,000/night`, min: 3000, max: 5000 },
  { label: `\u20B95,000\u2013\u20B910,000/night`, min: 5000, max: 10000 },
  { label: "Above \u20B910,000/night", min: 10001, max: Infinity },
];

const ROOM_OPTIONS = [
  { label: "Any Rooms", value: "any" },
  { label: "AC Rooms Available", value: "ac" },
  { label: "Non-AC Rooms Available", value: "non-ac" },
  { label: "5+ Total Rooms", value: "5" },
  { label: "10+ Total Rooms", value: "10" },
  { label: "20+ Total Rooms", value: "20" },
];

function matchesSearch(resort: Resort, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    resort.name.toLowerCase().includes(q) ||
    resort.destination.name.toLowerCase().includes(q) ||
    (resort.address ? resort.address.toLowerCase().includes(q) : false)
  );
}

function matchesPrice(price: number, min: number, max: number): boolean {
  return price >= min && price <= max;
}

function sortResorts(list: Resort[], sortValue: string): Resort[] {
  const sorted = [...list];
  switch (sortValue) {
    case "price-asc":
      sorted.sort((a, b) => a.priceMin - b.priceMin);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceMin - a.priceMin);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "rooms-desc":
      sorted.sort(
        (a, b) =>
          b.availableAcRooms + b.availableNonAcRooms -
          a.availableAcRooms - a.availableNonAcRooms
      );
      break;
    case "rooms-asc":
      sorted.sort(
        (a, b) =>
          a.availableAcRooms + a.availableNonAcRooms -
          b.availableAcRooms - b.availableNonAcRooms
      );
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }
  return sorted;
}

export default function ResortsSection({ userRole, userId }: { userRole?: string; userId?: string }) {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("All Destinations");
  const [roomFilter, setRoomFilter] = useState("any");
  const [priceFilterIndex, setPriceFilterIndex] = useState(0);
  const [amenityFilter, setAmenityFilter] = useState("All Amenities");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    async function fetchResorts() {
      try {
        const res = await fetch("/api/public/resorts");
        if (!res.ok) throw new Error("Failed to fetch resorts");
        const data = await res.json();
        setResorts(data.resorts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching resorts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResorts();
  }, []);

  const destinations = useMemo(() => {
    const names = new Set(resorts.map((r) => r.destination.name));
    return ["All Destinations", ...Array.from(names).sort()];
  }, [resorts]);

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    resorts.forEach((r) => {
      if (Array.isArray(r.amenities)) {
        r.amenities.forEach((a) => set.add(a));
      }
    });
    return ["All Amenities", ...Array.from(set).sort()];
  }, [resorts]);

  const totalRooms = useCallback(
    (r: Resort) => r.availableAcRooms + r.availableNonAcRooms,
    []
  );

  const filteredResorts = useMemo(() => {
    const priceRange = PRICE_OPTIONS[priceFilterIndex];
    let result = resorts.filter((r) => {
      if (
        destinationFilter !== "All Destinations" &&
        r.destination.name !== destinationFilter
      )
        return false;
      if (
        amenityFilter !== "All Amenities" &&
        (!Array.isArray(r.amenities) || !r.amenities.includes(amenityFilter))
      )
        return false;
      switch (roomFilter) {
        case "ac":
          if (r.availableAcRooms === 0) return false;
          break;
        case "non-ac":
          if (r.availableNonAcRooms === 0) return false;
          break;
        case "5":
          if (totalRooms(r) < 5) return false;
          break;
        case "10":
          if (totalRooms(r) < 10) return false;
          break;
        case "20":
          if (totalRooms(r) < 20) return false;
          break;
      }
      if (!matchesPrice(r.priceMin, priceRange.min, priceRange.max))
        return false;
      if (!matchesSearch(r, searchQuery)) return false;
      return true;
    });
    result = sortResorts(result, sortOption);
    return result;
  }, [
    resorts,
    destinationFilter,
    amenityFilter,
    roomFilter,
    priceFilterIndex,
    searchQuery,
    sortOption,
    totalRooms,
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDestinationFilter("All Destinations");
    setRoomFilter("any");
    setPriceFilterIndex(0);
    setAmenityFilter("All Amenities");
    setSortOption("default");
  }, []);

  const hasActiveFilters =
    searchQuery ||
    destinationFilter !== "All Destinations" ||
    roomFilter !== "any" ||
    priceFilterIndex !== 0 ||
    amenityFilter !== "All Amenities" ||
    sortOption !== "default";

  if (loading) {
    return (
      <div className="mt-10 flex justify-center py-20 max-md:py-12">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 rounded-lg border border-coral/30 bg-coral/10 p-6 text-center">
        <p className="font-bold text-coral">{error}</p>
      </div>
    );
  }

  if (resorts.length === 0) {
    return (
      <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.06] p-10 max-md:p-6 text-center">
        <p className="text-lg font-bold text-ivory">
          No approved resorts available yet.
        </p>
        <p className="mt-2 text-sm text-white/70">
          Check back soon for more listings!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 -mx-5 border-b border-white/10 bg-ink/95 px-5 py-4 shadow-sm backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 2xl:-mx-12 2xl:px-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search by name, destination, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 py-2.5 pl-10 pr-4 text-sm font-medium text-ivory outline-none transition placeholder:text-white/50 focus:border-coral focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-bold text-ivory outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {destinations.map((d) => (
                <option key={d} value={d} className="bg-ink text-ivory">
                  {d}
                </option>
              ))}
            </select>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-bold text-ivory outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {ROOM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-ink text-ivory">
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={priceFilterIndex}
              onChange={(e) => setPriceFilterIndex(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-bold text-ivory outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {PRICE_OPTIONS.map((opt, i) => (
                <option key={opt.label} value={i} className="bg-ink text-ivory">
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={amenityFilter}
              onChange={(e) => setAmenityFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-bold text-ivory outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {allAmenities.map((a) => (
                <option key={a} value={a} className="bg-ink text-ivory">
                  {a}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-bold text-ivory outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-ink text-ivory">
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2.5 text-sm font-bold text-coral transition hover:bg-coral hover:text-white"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredResorts.length === 0 ? (
        <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.06] p-10 max-md:p-6 text-center">
          <p className="text-lg font-bold text-ivory">
            No resorts match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-sm font-bold text-white transition hover:bg-coral/90"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResorts.map((resort, index) => (
            <ResortCard
              key={resort.id}
              resort={resort}
              index={index}
              showLocation={
                userRole === "SUPER_ADMIN" ||
                userRole === "VEHICLE_OWNER" ||
                (userRole === "RESORT_OWNER" && userId != null && resort.owner?.id === userId)
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
