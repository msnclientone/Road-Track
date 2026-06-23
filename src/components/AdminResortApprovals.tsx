"use client";

import { useEffect, useState } from "react";

export default function AdminResortApprovals() {
  const [resorts, setResorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/resorts/pending");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setResorts(data.resorts ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(resortId: string, status: string) {
    try {
      const res = await fetch("/api/admin/resorts/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setResorts((r) => r.filter((x) => x.id !== resortId));
    } catch (e: any) {
      alert(e?.message ?? "Unable to update status");
    }
  }

  if (loading) return <div>Loading pending resorts…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  return (
    <div>
      <h4 className="text-lg font-black">Resort submissions</h4>
      {resorts.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No pending resorts.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {resorts.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 p-4">
              <div>
                <p className="font-black">{r.name}</p>
                <p className="text-sm text-stone">Owner: {r.owner?.name ?? r.owner?.email}</p>
                <p className="text-sm text-stone">Price: {r.priceMin}-{r.priceMax}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(r.id, "APPROVED")} className="rounded-md bg-mint px-3 py-2 font-black text-ink">Approve</button>
                <button onClick={() => updateStatus(r.id, "REJECTED")} className="rounded-md border border-ink/15 px-3 py-2 font-black text-stone">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
