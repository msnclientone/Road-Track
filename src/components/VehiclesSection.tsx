"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Users, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getListingImageUrl } from "@/lib/placeholders";

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

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="mt-10 flex justify-center py-20">
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
      <div className="mt-10 rounded-lg border border-ink/10 bg-white p-10 text-center">
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
    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Link
          href={`/vehicle/${vehicle.id}`}
          key={vehicle.id}
          className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <article className="h-full">
            <div className="relative aspect-[16/10]">
              <Image
                src={getListingImageUrl(vehicle.media, "vehicle")}
                alt={vehicle.vehicleType}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{vehicle.vehicleType}</h3>
                  <p className="mt-1 text-sm font-bold text-stone">
                    {vehicle.registrationNo}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-sm font-bold text-stone">
                Driver: {vehicle.driverName}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md bg-sky/10 p-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="mt-1 font-black">{vehicle.seatingCapacity}</p>
                  <p className="text-xs font-bold text-stone">Seats</p>
                </div>
                <div className="rounded-md bg-coral/10 p-3">
                  <p className="font-black text-coral">
                    {formatCurrency(vehicle.pricePerDay)}
                  </p>
                  <p className="text-xs font-bold text-stone">Per Day</p>
                </div>
                <div className="rounded-md bg-mint/10 p-3">
                  <p className="font-black text-emerald-700">
                    {formatCurrency(vehicle.pricePerKm)}
                  </p>
                  <p className="text-xs font-bold text-stone">Per KM</p>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
