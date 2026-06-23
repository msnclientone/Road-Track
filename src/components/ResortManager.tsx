"use client";

import { useState } from "react";
import { destinations } from "@/lib/data";

type ResortInput = {
  name: string;
  description: string;
  address?: string;
  priceMin: number;
  priceMax: number;
  amenities?: string | string[];
  destinationId: string;
};

export default function ResortManager({ initialResorts }: { initialResorts: any[] }) {
  const [tab, setTab] = useState<'list'|'add'>('list');
  const [resorts, setResorts] = useState<any[]>(initialResorts || []);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ResortInput>({ name: '', description: '', priceMin: 0, priceMax: 0, destinationId: '' });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/partner/resort/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create resort');
      setResorts((r) => [data.resort, ...r]);
      setTab('list');
      setForm({ name: '', description: '', priceMin: 0, priceMax: 0, destinationId: '' });
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
          <button onClick={() => setTab('list')} className={`px-3 py-1 font-bold ${tab==='list' ? 'bg-ivory' : ''}`}>My Resorts</button>
          <button onClick={() => setTab('add')} className={`px-3 py-1 font-bold ${tab==='add' ? 'bg-ivory' : ''}`}>Add Resort</button>
        </div>
      </div>

      {tab === 'list' ? (
        <div className="mt-4 grid gap-3">
          {resorts.length === 0 ? (
            <p className="text-sm text-stone">No resorts yet. Use "Add Resort" to create one.</p>
          ) : (
            resorts.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 p-3">
                <div>
                  <p className="font-black">{r.name}</p>
                  <p className="text-sm text-stone">{r.destination?.name ?? r.destinationId} • {r.address ?? 'Address not set'}</p>
                  <p className="text-sm text-stone">Price: {r.priceMin} - {r.priceMax}</p>
                </div>
                <div className="text-sm text-stone">Status: {r.status ?? 'N/A'}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            Resort name
            <input required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Destination
            <select required value={form.destinationId} onChange={(e)=>setForm({...form, destinationId:e.target.value})} className="rounded-md border px-3 py-2">
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name} ({d.slug})</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Short description
            <textarea required value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Address
            <input value={form.address ?? ''} onChange={(e)=>setForm({...form, address:e.target.value})} className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Price min
            <input required type="number" value={form.priceMin} onChange={(e)=>setForm({...form, priceMin: Number(e.target.value)})} className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Price max
            <input required type="number" value={form.priceMax} onChange={(e)=>setForm({...form, priceMax: Number(e.target.value)})} className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Amenities (comma separated)
            <input value={typeof form.amenities === 'string' ? form.amenities : ''} onChange={(e)=>setForm({...form, amenities: e.target.value})} className="rounded-md border px-3 py-2" />
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
