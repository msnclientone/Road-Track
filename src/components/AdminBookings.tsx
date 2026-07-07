"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type BookingOwner = {
  name: string | null;
  phone: string | null;
  email: string | null;
  resortOwnerId?: string | null;
  vehicleOwnerId?: string | null;
};

type Booking = {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  destinationName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  numDays: number | null;
  numNights: number | null;
  numPeople: number | null;
  vehicleRegNo: string | null;
  vehicleOwnerId: string | null;
  resortOwnerId: string | null;
  pricingMode: string | null;
  distance: string | null;
  roomType: string | null;
  vehicleCost: number | null;
  resortCost: number | null;
  totalCost: number | null;
  perHeadCost: number | null;
  status: string;
  createdAt: string;
  selectedResort: {
    id: string;
    name: string;
    ownerId: string | null;
    priceMin: number;
    priceMax: number;
    googleMapsLink: string | null;
    destination: { name: string } | null;
    owner: BookingOwner | null;
  } | null;
  selectedVehicle: {
    id: string;
    vehicleType: string;
    registrationNo: string | null;
    ownerId: string | null;
    pricePerDay: number | null;
    pricePerKm: number | null;
    minimumPrice: number | null;
    minimumKm: number | null;
    destination: { name: string } | null;
    owner: BookingOwner | null;
  } | null;
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber/20 text-amber",
  CONFIRMED: "bg-mint/20 text-mint",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-coral/20 text-coral",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const DISPLAY_LIMIT = 10;

export default function AdminBookings() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedBooking) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedBooking(null);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [selectedBooking]);

  const fetchBookings = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/bookings${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setAllBookings(data.bookings ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const isSearchActive = searchQuery.trim().length > 0;
  const displayBookings = isSearchActive || showAll
    ? allBookings
    : allBookings.slice(0, DISPLAY_LIMIT);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setShowAll(false);
    const timer = setTimeout(() => {
      fetchBookings(searchQuery.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchBookings]);

  async function updateStatus(bookingId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setAllBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );
      setSelectedBooking((prev) =>
        prev?.id === bookingId ? { ...prev, status } : prev,
      );
    } catch (e: any) {
      alert(e?.message ?? "Unable to update status");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-black">Booking Details</h3>
        {allBookings.length > 0 && (
          <span className="text-sm font-semibold text-stone">
            {allBookings.length} total
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search Booking ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-ink placeholder-stone/60 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
        />
      </div>

      {loading && <p className="mt-6 text-sm text-stone">Loading bookings...</p>}
      {error && <p className="mt-6 text-sm text-coral">{error}</p>}

      {!loading && !error && allBookings.length === 0 && (
        <p className="mt-6 text-sm text-stone">
          {searchQuery.trim()
            ? "No bookings match your search."
            : "No bookings yet."}
        </p>
      )}

      {!loading && !error && displayBookings.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-stone">
                <th className="pb-2 pr-4 font-bold">Booking ID</th>
                <th className="pb-2 pr-4 font-bold">Customer</th>
                <th className="pb-2 pr-4 font-bold">Destination</th>
                <th className="pb-2 pr-4 font-bold">Date</th>
                <th className="pb-2 pr-4 font-bold">Total</th>
                <th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayBookings.map((b) => (
                <tr
                  key={b.id}
                  className="cursor-pointer border-b border-ink/5 transition hover:bg-ink/[0.02]"
                  onClick={() => setSelectedBooking(b)}
                >
                  <td className="py-3 pr-4 font-mono font-bold">{b.bookingId}</td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold">{b.customerName}</span>
                  </td>
                  <td className="py-3 pr-4 text-stone">{b.destinationName || "—"}</td>
                  <td className="py-3 pr-4 text-stone">
                    {formatDate(b.createdAt)}
                  </td>
                  <td className="py-3 pr-4 font-semibold">
                    {formatCurrency(b.totalCost)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-black uppercase ${STATUS_COLORS[b.status] ?? "bg-ink/10 text-stone"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isSearchActive && allBookings.length > DISPLAY_LIMIT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 text-sm font-bold text-coral hover:underline"
            >
              {showAll ? "Show Less" : `View All (${allBookings.length})`}
            </button>
          )}
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">
                {selectedBooking.bookingId}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-bold transition hover:bg-ink/5"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h4 className="text-base font-black text-stone">Booking Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone">Booking ID</span>
                    <span className="font-mono font-semibold">{selectedBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Created Date</span>
                    <span className="font-semibold">{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Customer Name</span>
                    <span className="font-semibold">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Customer Phone</span>
                    <span className="font-semibold">{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Destination</span>
                    <span className="font-semibold">{selectedBooking.destinationName || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Check-in</span>
                    <span className="font-semibold">{formatDate(selectedBooking.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Check-out</span>
                    <span className="font-semibold">{formatDate(selectedBooking.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">People</span>
                    <span className="font-semibold">{selectedBooking.numPeople ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Days</span>
                    <span className="font-semibold">{selectedBooking.numDays ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Nights</span>
                    <span className="font-semibold">{selectedBooking.numNights ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Distance</span>
                    <span className="font-semibold">{selectedBooking.distance ? `${selectedBooking.distance} KM` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Pricing Mode</span>
                    <span className="font-semibold">
                      {selectedBooking.pricingMode === "perKm"
                        ? "Per KM"
                        : selectedBooking.pricingMode === "fullDay"
                          ? "Full-Day Rental"
                          : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Room Type</span>
                    <span className="font-semibold">
                      {selectedBooking.roomType === "ac"
                        ? "AC"
                        : selectedBooking.roomType === "nonAc"
                          ? "Non-AC"
                          : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Vehicle Cost</span>
                    <span className="font-semibold">{formatCurrency(selectedBooking.vehicleCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Resort Cost</span>
                    <span className="font-semibold">{formatCurrency(selectedBooking.resortCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Total Cost</span>
                    <span className="font-semibold">{formatCurrency(selectedBooking.totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Per Head Cost</span>
                    <span className="font-semibold">{formatCurrency(selectedBooking.perHeadCost)}</span>
                  </div>
                </div>
              </section>

              {selectedBooking.selectedVehicle && (
                <section>
                  <h4 className="text-base font-black text-stone">Vehicle Details</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Name / Type</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Registration Number</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.registrationNo || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Owner ID</span>
                      <span className="font-mono font-semibold">{selectedBooking.selectedVehicle.owner?.vehicleOwnerId ?? selectedBooking.vehicleOwnerId ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Owner Name</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.owner?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Owner Phone</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.owner?.phone ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Vehicle Owner Email</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.owner?.email ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Destination</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.destination?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Current Vehicle Price</span>
                      <span className="font-semibold">
                        {selectedBooking.selectedVehicle.pricePerDay != null && selectedBooking.selectedVehicle.pricePerKm != null
                          ? `${formatCurrency(selectedBooking.selectedVehicle.pricePerDay)} / day • ${formatCurrency(selectedBooking.selectedVehicle.pricePerKm)} / km`
                          : selectedBooking.selectedVehicle.pricePerDay != null
                            ? `${formatCurrency(selectedBooking.selectedVehicle.pricePerDay)} / day`
                            : selectedBooking.selectedVehicle.pricePerKm != null
                              ? `${formatCurrency(selectedBooking.selectedVehicle.pricePerKm)} / km`
                              : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Minimum Charge</span>
                      <span className="font-semibold">{formatCurrency(selectedBooking.selectedVehicle.minimumPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Minimum Distance</span>
                      <span className="font-semibold">{selectedBooking.selectedVehicle.minimumKm != null ? `${selectedBooking.selectedVehicle.minimumKm} KM` : "—"}</span>
                    </div>
                  </div>
                </section>
              )}

              {selectedBooking.selectedResort && (
                <section>
                  <h4 className="text-base font-black text-stone">Resort Details</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone">Resort Name</span>
                      <span className="font-semibold">{selectedBooking.selectedResort.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Resort Owner ID</span>
                      <span className="font-mono font-semibold">{selectedBooking.selectedResort.owner?.resortOwnerId ?? selectedBooking.resortOwnerId ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Resort Owner Name</span>
                      <span className="font-semibold">{selectedBooking.selectedResort.owner?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Resort Owner Phone</span>
                      <span className="font-semibold">{selectedBooking.selectedResort.owner?.phone ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Resort Owner Email</span>
                      <span className="font-semibold">{selectedBooking.selectedResort.owner?.email ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Destination</span>
                      <span className="font-semibold">{selectedBooking.selectedResort.destination?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Google Maps Location</span>
                      <span className="font-semibold">
                        {selectedBooking.selectedResort.googleMapsLink ? (
                          <a
                            href={selectedBooking.selectedResort.googleMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-coral hover:underline"
                          >
                            Open Google Maps
                          </a>
                        ) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">AC Room Price</span>
                      <span className="font-semibold">{formatCurrency(selectedBooking.selectedResort.priceMax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Non-AC Room Price</span>
                      <span className="font-semibold">{formatCurrency(selectedBooking.selectedResort.priceMin)}</span>
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-base font-black text-stone">Booking Status</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedBooking.id, status)}
                      className={`rounded-md px-4 py-2 text-sm font-black transition ${
                        selectedBooking.status === status
                          ? "bg-ink text-white"
                          : "border border-ink/15 text-stone hover:bg-ink/5"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
