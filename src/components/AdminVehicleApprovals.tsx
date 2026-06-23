"use client";

import { useEffect, useState } from "react";

export default function AdminVehicleApprovals() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vehicles/pending");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setVehicles(data.vehicles ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(vehicleId: string, status: string) {
    try {
      const res = await fetch("/api/admin/vehicles/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setVehicles((r) => r.filter((x) => x.id !== vehicleId));
    } catch (e: any) {
      alert(e?.message ?? "Unable to update status");
    }
  }

  if (loading) return <div>Loading pending vehicles…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  return (
    <div>
      <h4 className="text-lg font-black">Vehicle submissions</h4>
      {vehicles.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No pending vehicles.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 p-4">
              <div>
                <p className="font-black">{v.vehicleType}</p>
                <p className="text-sm text-stone">Owner: {v.owner?.name ?? v.owner?.email}</p>
                <p className="text-sm text-stone">Seats: {v.seatingCapacity} • Rate/km: {v.pricePerKm ?? '—'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(v.id, "APPROVED")} className="rounded-md bg-mint px-3 py-2 font-black text-ink">Approve</button>
                <button onClick={() => updateStatus(v.id, "REJECTED")} className="rounded-md border border-ink/15 px-3 py-2 font-black text-stone">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
