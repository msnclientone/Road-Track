"use client";

import { useEffect, useState } from "react";

type PartnerUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  partnerStatus: string | null;
  createdAt: string;
};

export default function AdminPartnerApprovals() {
  const [users, setUsers] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pending-partners");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setUsers(data.users ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(userId: string, status: string) {
    try {
      const res = await fetch("/api/admin/partner/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch (e: any) {
      alert(e?.message ?? "Unable to update status");
    }
  }

  if (loading) return <div>Loading pending partners…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  return (
    <section>
      <h3 className="text-xl font-black">Pending partner approvals</h3>
      {users.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No pending partner approvals.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 rounded-md border border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-black">{u.name ?? "—"} <span className="text-sm font-semibold text-stone">({u.role})</span></p>
                <p className="text-sm text-stone break-all">{u.email} • {u.phone ?? "—"}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => updateStatus(u.id, "APPROVED")} className="rounded-md bg-mint px-3 py-2 font-black text-ink">Approve</button>
                <button onClick={() => updateStatus(u.id, "REJECTED")} className="rounded-md border border-ink/15 px-3 py-2 font-black text-stone">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
