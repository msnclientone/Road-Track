"use client";

import { useState } from "react";

type VehicleInput = {
  vehicleType: string;
  seatingCapacity: number;
  pricePerKm?: number;
  pricePerDay?: number;
  driverName?: string;
  driverPhone?: string;
  registrationNo?: string;
  destinationId?: string | null;
};

export default function VehicleManager({ initialVehicles }: { initialVehicles: any[] }) {
  const [tab, setTab] = useState<'list'|'add'>('list');
  const [vehicles, setVehicles] = useState<any[]>(initialVehicles || []);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VehicleInput>({ vehicleType: '', seatingCapacity: 4 });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/partner/vehicle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create vehicle');
      // reload list: simplest is to append the new item
      setVehicles((v) => [data.vehicle, ...v]);
      setTab('list');
      setForm({ vehicleType: '', seatingCapacity: 4 });
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setTab('list')} className={`px-3 py-1 font-bold ${tab==='list' ? 'bg-ivory' : ''}`}>My Vehicles</button>
          <button onClick={() => setTab('add')} className={`px-3 py-1 font-bold ${tab==='add' ? 'bg-ivory' : ''}`}>Add Vehicle</button>
        </div>
      </div>

      {tab === 'list' ? (
        <div className="mt-4 grid gap-3">
          {vehicles.length === 0 ? (
            <p className="text-sm text-stone">No vehicles yet. Use "Add Vehicle" to create one.</p>
          ) : (
            vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 p-3">
                <div>
                  <p className="font-black">{v.vehicleType} • {v.seatingCapacity} seats</p>
                  <p className="text-sm text-stone">Per km: {v.pricePerKm ?? '—'} • Per day: {v.pricePerDay ?? '—'}</p>
                  <p className="text-sm text-stone">Reg: {v.registrationNo ?? '—'}</p>
                </div>
                <div className="text-sm text-stone">Status: {v.status ?? v.availability ?? 'N/A'}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            Vehicle type
            <input required value={form.vehicleType} onChange={(e)=>setForm({...form, vehicleType:e.target.value})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Seating capacity
            <input required type="number" value={form.seatingCapacity} onChange={(e)=>setForm({...form, seatingCapacity: Number(e.target.value)})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Price per km
            <input type="number" value={form.pricePerKm ?? ''} onChange={(e)=>setForm({...form, pricePerKm: e.target.value ? Number(e.target.value) : undefined})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Price per day
            <input type="number" value={form.pricePerDay ?? ''} onChange={(e)=>setForm({...form, pricePerDay: e.target.value ? Number(e.target.value) : undefined})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Driver name
            <input value={form.driverName ?? ''} onChange={(e)=>setForm({...form, driverName: e.target.value})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Driver phone
            <input value={form.driverPhone ?? ''} onChange={(e)=>setForm({...form, driverPhone: e.target.value})} className="rounded-md border px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Registration No
            <input value={form.registrationNo ?? ''} onChange={(e)=>setForm({...form, registrationNo: e.target.value})} className="rounded-md border px-3 py-2" />
          </label>

          <div className="flex gap-2">
            <button disabled={loading} className="rounded-md bg-ink px-4 py-2 font-black text-white">{loading ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={()=>setTab('list')} className="rounded-md border px-4 py-2">Cancel</button>
          </div>
          {error && <p className="text-coral">{error}</p>}
        </form>
      )}
    </div>
  );
}
