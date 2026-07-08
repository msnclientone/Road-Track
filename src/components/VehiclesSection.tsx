"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";

type Vehicle = {
  id: string;
  vehicleType: string;
  registrationNo: string;
  seatingCapacity: number;
  pricePerDay: number;
  pricePerKm: number;
  driverName: string;
  driverPhone: string | null;
  media?: { url: string; order: number }[];
  destination: {
    name: string;
    slug: string;
  } | null;
  owner: {
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt: string;
};

const VEHICLE_TYPES = [
  "All Vehicles",
  "Bike",
  "Scooter",
  "Hatchback",
  "Sedan",
  "SUV",
  "MUV",
  "Luxury Car",
  "Tempo Traveller",
  "Mini Bus",
  "Bus",
  "Pickup",
  "Truck",
];

const SEATING_OPTIONS = [
  { label: "All", value: 0 },
  { label: "2+", value: 2 },
  { label: "4+", value: 4 },
  { label: "6+", value: 6 },
  { label: "8+", value: 8 },
  { label: "12+", value: 12 },
  { label: "20+", value: 20 },
  { label: "30+", value: 30 },
];

const PRICE_OPTIONS = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Below \u20B91000/day", min: 0, max: 999 },
  { label: "\u20B91000\u2013\u20B92000/day", min: 1000, max: 2000 },
  { label: "\u20B92000\u2013\u20B95000/day", min: 2000, max: 5000 },
  { label: "Above \u20B95000/day", min: 5001, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low \u2192 High", value: "price-asc" },
  { label: "Price: High \u2192 Low", value: "price-desc" },
  { label: "Seating Capacity: Low \u2192 High", value: "seats-asc" },
  { label: "Seating Capacity: High \u2192 Low", value: "seats-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Vehicle Type (A-Z)", value: "type-asc" },
];

function matchesPrice(
  price: number,
  min: number,
  max: number
): boolean {
  return price >= min && price <= max;
}

function matchesSeating(
  seats: number,
  minSeats: number
): boolean {
  return minSeats === 0 || seats >= minSeats;
}

function matchesSearch(
  vehicle: Vehicle,
  query: string
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    vehicle.vehicleType.toLowerCase().includes(q) ||
    vehicle.registrationNo.toLowerCase().includes(q) ||
    vehicle.driverName.toLowerCase().includes(q)
  );
}

function sortVehicles(
  list: Vehicle[],
  sortValue: string
): Vehicle[] {
  const sorted = [...list];
  switch (sortValue) {
    case "price-asc":
      sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
      break;
    case "seats-asc":
      sorted.sort((a, b) => a.seatingCapacity - b.seatingCapacity);
      break;
    case "seats-desc":
      sorted.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
      break;
    case "type-asc":
      sorted.sort((a, b) =>
        a.vehicleType.localeCompare(b.vehicleType)
      );
      break;
  }
  return sorted;
}

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] =
    useState("All Vehicles");
  const [seatingFilter, setSeatingFilter] = useState(0);
  const [priceFilterIndex, setPriceFilterIndex] = useState(0);
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/public/vehicles");
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  const uniqueDestinations = useMemo(() => {
    const names = Array.from(
      new Set(vehicles.map((v) => v.destination?.name).filter(Boolean))
    ) as string[];
    return names.sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const priceRange = PRICE_OPTIONS[priceFilterIndex];
    let result = vehicles.filter((v) => {
      if (
        vehicleTypeFilter !== "All Vehicles" &&
        v.vehicleType !== vehicleTypeFilter
      )
        return false;
      if (!matchesSeating(v.seatingCapacity, seatingFilter))
        return false;
      if (!matchesPrice(v.pricePerDay, priceRange.min, priceRange.max))
        return false;
      if (!matchesSearch(v, searchQuery)) return false;
      if (
        destinationFilter !== "All" &&
        v.destination?.name !== destinationFilter
      )
        return false;
      return true;
    });
    result = sortVehicles(result, sortOption);
    return result;
  }, [
    vehicles,
    vehicleTypeFilter,
    seatingFilter,
    priceFilterIndex,
    searchQuery,
    sortOption,
    destinationFilter,
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setVehicleTypeFilter("All Vehicles");
    setSeatingFilter(0);
    setPriceFilterIndex(0);
    setDestinationFilter("All");
    setSortOption("default");
  }, []);

  const hasActiveFilters =
    searchQuery ||
    vehicleTypeFilter !== "All Vehicles" ||
    seatingFilter !== 0 ||
    priceFilterIndex !== 0 ||
    destinationFilter !== "All" ||
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

  if (vehicles.length === 0) {
    return (
      <div className="mt-10 rounded-lg border border-ink/10 bg-white p-10 max-md:p-6 text-center">
        <p className="text-lg font-bold text-stone">
          No approved vehicles available yet.
        </p>
        <p className="mt-2 text-sm text-stone">
          Check back soon for more listings!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 -mx-5 border-b border-ink/10 bg-white/95 px-5 py-4 shadow-sm backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 2xl:-mx-12 2xl:px-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="text"
              placeholder="Search by type, registration, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={seatingFilter}
              onChange={(e) => setSeatingFilter(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {SEATING_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={priceFilterIndex}
              onChange={(e) =>
                setPriceFilterIndex(Number(e.target.value))
              }
              className="cursor-pointer rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {PRICE_OPTIONS.map((opt, i) => (
                <option key={opt.label} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>

            {uniqueDestinations.length > 0 && (
              <select
                value={destinationFilter}
                onChange={(e) =>
                  setDestinationFilter(e.target.value)
                }
                className="cursor-pointer rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              >
                <option value="All">All Destinations</option>
                {uniqueDestinations.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="cursor-pointer rounded-lg border border-ink/10 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
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

      {filteredVehicles.length === 0 ? (
        <div className="mt-10 rounded-lg border border-ink/10 bg-white p-10 max-md:p-6 text-center">
          <p className="text-lg font-bold text-stone">
            No vehicles match your filters.
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
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={{ ...vehicle, destinationName: vehicle.destination?.name }} />
          ))}
        </div>
      )}
    </>
  );
}
