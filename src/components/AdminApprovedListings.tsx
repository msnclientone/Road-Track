"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Resort = {
  id: string;
  name: string;
  description: string;
  address: string | null;
  priceMin: number;
  priceMax: number;
  amenities: any;
  status: string;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  destination: {
    id: string;
    name: string;
  } | null;
};

type Vehicle = {
  id: string;
  vehicleType: string;
  registrationNo: string | null;
  seatingCapacity: number;
  driverName: string;
  driverPhone: string;
  pricePerDay: number | null;
  pricePerKm: number | null;
  availability: string;
  status: string;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  destination: {
    id: string;
    name: string;
  } | null;
};

export default function AdminApprovedListings() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        const [resortsRes, vehiclesRes] = await Promise.all([
          fetch("/api/admin/approved-resorts"),
          fetch("/api/admin/approved-vehicles"),
        ]);

        if (!resortsRes.ok || !vehiclesRes.ok) {
          throw new Error("Unable to fetch listings");
        }

        const resortsData = await resortsRes.json();
        const vehiclesData = await vehiclesRes.json();

        setResorts(resortsData.resorts || []);
        setVehicles(vehiclesData.vehicles || []);
      } catch (err: any) {
        setError(err?.message || "Error loading listings");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) return <p className="text-center text-stone">Loading approved listings...</p>;
  if (error) return <p className="text-center text-coral">Error: {error}</p>;

  return (
    <div className="space-y-10">
      {/* Resorts Table */}
      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/10 p-4 sm:p-5">
          <h2 className="text-xl font-black sm:text-2xl">Approved Resorts</h2>
          <p className="mt-1 text-sm text-stone font-semibold">{resorts.length} resorts approved and ready to book</p>
        </div>

        {resorts.length === 0 ? (
          <p className="p-4 text-sm text-stone sm:p-5">No approved resorts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm lg:min-w-[1200px]">
              <thead className="bg-ivory text-xs uppercase tracking-[0.14em] text-stone">
                <tr>
                  <th className="px-4 py-3">Resort Name</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Price Range</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Owner Name</th>
                  <th className="px-4 py-3">Owner Email</th>
                  <th className="px-4 py-3">Owner Phone</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {resorts.map((resort) => (
                  <tr key={resort.id} className="border-t border-ink/10 hover:bg-ivory/50">
                    <td className="px-4 py-3 font-bold">{resort.name}</td>
                    <td className="px-4 py-3">{resort.destination?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold text-coral">
                        <IndianRupee className="h-4 w-4" />
                        {formatCurrency(resort.priceMin)} - {formatCurrency(resort.priceMax)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{resort.address || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{resort.owner?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-coral" />
                        {resort.owner?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-coral" />
                        {resort.owner?.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone">
                      {new Date(resort.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Vehicles Table */}
      <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/10 p-4 sm:p-5">
          <h2 className="text-xl font-black sm:text-2xl">Approved Vehicles</h2>
          <p className="mt-1 text-sm text-stone font-semibold">{vehicles.length} vehicles approved and ready to book</p>
        </div>

        {vehicles.length === 0 ? (
          <p className="p-4 text-sm text-stone sm:p-5">No approved vehicles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm lg:min-w-[1300px]">
              <thead className="bg-ivory text-xs uppercase tracking-[0.14em] text-stone">
                <tr>
                  <th className="px-4 py-3">Vehicle Type</th>
                  <th className="px-4 py-3">Registration No</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Driver Phone</th>
                  <th className="px-4 py-3">Price/Day</th>
                  <th className="px-4 py-3">Price/KM</th>
                  <th className="px-4 py-3">Owner Name</th>
                  <th className="px-4 py-3">Owner Email</th>
                  <th className="px-4 py-3">Owner Phone</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-ink/10 hover:bg-ivory/50">
                    <td className="px-4 py-3 font-bold">{vehicle.vehicleType}</td>
                    <td className="px-4 py-3 text-xs">{vehicle.registrationNo || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{vehicle.seatingCapacity}</td>
                    <td className="px-4 py-3">{vehicle.driverName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-coral" />
                        {vehicle.driverPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {vehicle.pricePerDay ? (
                        <div className="flex items-center gap-1 text-coral">
                          <IndianRupee className="h-4 w-4" />
                          {formatCurrency(vehicle.pricePerDay)}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {vehicle.pricePerKm ? (
                        <div className="flex items-center gap-1 text-coral">
                          <IndianRupee className="h-4 w-4" />
                          {formatCurrency(vehicle.pricePerKm)}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">{vehicle.owner?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-coral" />
                        {vehicle.owner?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-coral" />
                        {vehicle.owner?.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone">
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
