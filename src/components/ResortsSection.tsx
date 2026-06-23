"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getListingImageUrl } from "@/lib/placeholders";

type Resort = {
  id: string;
  name: string;
  address: string;
  description: string;
  priceMin: number;
  priceMax: number;
  amenities: string[];
  media?: { url: string; type: string; order: number }[];
  destination: {
    name: string;
    slug: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt: string;
};

export default function ResortsSection() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (resorts.length === 0) {
    return (
      <div className="mt-10 rounded-lg border border-ink/10 bg-white p-10 text-center">
        <p className="text-lg font-bold text-stone">
          No approved resorts available yet.
        </p>
        <p className="mt-2 text-sm text-stone">
          Check back soon for more listings!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      {resorts.map((resort, index) => (
        <Link
          href={`/resort/${resort.id}`}
          key={resort.id}
          className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] transition hover:-translate-y-1 hover:shadow-lg"
        >
          <article className="h-full text-ivory">
            <div className="relative aspect-[16/10]">
              <Image
                src={getListingImageUrl(resort.media, "resort")}
                alt={resort.name}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{resort.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                    <MapPin className="h-4 w-4 text-coral" />
                    {resort.address}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-white/70 line-clamp-2">
                {resort.description}
              </p>

              {resort.amenities && resort.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resort.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-white/75"
                    >
                      {amenity}
                    </span>
                  ))}
                  {resort.amenities.length > 3 && (
                    <span className="text-xs font-bold text-white/75">
                      +{resort.amenities.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Starting from</p>
                  <p className="text-xl font-black">
                    {formatCurrency(resort.priceMin)}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
