"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { formatCurrency, maskRegistrationNo } from "@/lib/utils";
import { getListingImageUrl, PLACEHOLDER_IMAGES } from "@/lib/placeholders";
import { vehicleImages } from "@/lib/vehicleImages";
type VehicleData = {
  id: string;
  vehicleType: string;
  registrationNo: string | null;
  seatingCapacity: number;
  pricePerDay: number | null;
  pricePerKm: number | null;
  driverName: string;
  destinationName?: string | null;
  media?: { url: string; order: number }[];
};

type Props = {
  vehicle: VehicleData;
  showRemoveButton?: boolean;
  itemId?: string;
  onRemove?: (itemId: string) => void;
};

export default function VehicleCard({
  vehicle,
  showRemoveButton,
  itemId,
  onRemove,
}: Props) {
  const [imgSrc, setImgSrc] = useState(() =>
    vehicle.media?.length
      ? getListingImageUrl(vehicle.media, "vehicle")
      : vehicleImages[vehicle.vehicleType] ?? "/vehicle-images/default.jpg",
  );

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10]">
          <Image
            src={imgSrc}
            alt={vehicle.vehicleType}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
            onError={() => setImgSrc(PLACEHOLDER_IMAGES.vehicle)}
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">{vehicle.vehicleType}</h3>
              {vehicle.registrationNo && (
                <p className="mt-1 text-sm font-bold text-stone">
                  {maskRegistrationNo(vehicle.registrationNo)}
                </p>
              )}
              {vehicle.destinationName && (
                <p className="mt-1 text-xs font-semibold text-stone">
                  {vehicle.destinationName}
                </p>
              )}
            </div>
          </div>

          <p className="mt-2 text-sm font-bold text-stone">
            Driver: {vehicle.driverName}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-sky/10 p-3">
              <Users className="h-4 w-4" />
              <p className="mt-1 font-black">{vehicle.seatingCapacity}</p>
              <p className="text-xs font-bold text-stone">Seats</p>
            </div>
            <div className="rounded-lg bg-coral/10 p-3">
              <p className="font-black text-coral">
                {vehicle.pricePerDay != null
                  ? formatCurrency(vehicle.pricePerDay)
                  : "N/A"}
              </p>
              <p className="text-xs font-bold text-stone">Per Day</p>
            </div>
            <div className="rounded-md bg-mint/10 p-3">
              <p className="font-black text-emerald-700">
                {vehicle.pricePerKm != null
                  ? formatCurrency(vehicle.pricePerKm)
                  : "N/A"}
              </p>
              <p className="text-xs font-bold text-stone">Per KM</p>
            </div>
          </div>

          {showRemoveButton && itemId && onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(itemId);
              }}
              className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
