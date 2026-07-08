"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import ResortCard from "@/components/ResortCard";

type BucketItem = {
  id: string;
  resort: {
    id: string;
    name: string;
    address: string | null;
    description: string;
    priceMin: number;
    amenities: string[];
    googleMapsLink: string | null;
    media: { url: string; type?: string; order: number }[];
    destination: { name: string };
  } | null;
  vehicle: {
    id: string;
    vehicleType: string;
    registrationNo: string | null;
    seatingCapacity: number;
    pricePerDay: number | null;
    pricePerKm: number | null;
    driverName: string;
    media: { url: string; order: number }[];
    destination: { name: string } | null;
  } | null;
};

export default function BucketContent({ showLocation = false }: { showLocation?: boolean }) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBucket() {
    try {
      setLoading(true);
      const res = await fetch("/api/bucket");
      if (!res.ok) throw new Error("Failed to fetch bucket");
      const data = await res.json();
      setItems(data.bucket?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBucket();
  }, []);

  async function handleRemove(itemId: string) {
    const res = await fetch("/api/bucket/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to remove item");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function handleClear() {
    const confirmed = window.confirm(
      "Are you sure you want to clear your bucket?"
    );
    if (!confirmed) return;

    const res = await fetch("/api/bucket/clear", {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to clear bucket");
      return;
    }

    setItems([]);
  }

  if (loading) {
    return (
      <div className="mt-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  const resortItems = items.filter((item) => item.resort);
  const vehicleItems = items.filter((item) => item.vehicle);

  if (items.length === 0) {
    return (
      <>
        <div className="mt-8 rounded-lg border bg-white p-6 text-center sm:mt-10 sm:p-8 max-md:p-5">
          <h2 className="text-xl font-black sm:text-2xl">Bucket is Empty</h2>
          <p className="mt-3 text-sm text-stone sm:text-base">
            Browse resorts and vehicles to add them.
          </p>
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/"
            className="rounded-lg bg-coral px-6 py-3 font-black text-ink hover:bg-coral/90"
          >
            Browse Listings
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between sm:mt-10">
        <h2 className="text-xl font-black sm:text-2xl">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </h2>

        <button
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          <Trash2 className="h-4 w-4" />
          Clear Bucket
        </button>
      </div>

      {vehicleItems.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-5 text-lg font-black text-ink">Vehicles</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicleItems.map((item) => (
              <VehicleCard
                key={item.id}
                vehicle={item.vehicle!}
                showRemoveButton
                itemId={item.id}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </section>
      )}

      {resortItems.length > 0 && (
        <section className="mt-10 rounded-xl bg-ink p-6 sm:p-8">
          <h3 className="mb-5 text-lg font-black text-ivory">Resorts</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resortItems.map((item) => (
              <ResortCard
                key={item.id}
                resort={item.resort!}
                showRemoveButton
                itemId={item.id}
                onRemove={handleRemove}
                showLocation={showLocation}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex justify-end sm:mt-10">
        <Link
          href="/planner"
          className="w-full rounded-lg bg-coral px-6 py-3 text-center font-black text-ink hover:bg-coral/90 sm:w-auto"
        >
          Proceed to Trip Planner &rarr;
        </Link>
      </div>
    </>
  );
}
