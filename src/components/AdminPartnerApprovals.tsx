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
      setUsers((u) =>
        u.map((x) => (x.id === userId ? { ...x, partnerStatus: status } : x)),
      );
    } catch (e: any) {
      alert(e?.message ?? "Unable to update status");
    }
  }

  if (loading) return <div>Loading partners…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  const resortOwners = users.filter((u) => u.role === "RESORT_OWNER");
  const vehicleOwners = users.filter((u) => u.role === "VEHICLE_OWNER");

  return (
    <section>
      <h3 className="text-xl font-black">Registered Partners</h3>
      {users.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No registered partners.</p>
      ) : (
        <div className="mt-4 grid gap-6">
          <div>
            <h4 className="text-lg font-black text-stone">Resort Owners ({resortOwners.length})</h4>
            <div className="mt-2 grid gap-3">
              {resortOwners.map((u) => (
                <PartnerCard key={u.id} user={u} onUpdateStatus={updateStatus} />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-stone">Vehicle Owners ({vehicleOwners.length})</h4>
            <div className="mt-2 grid gap-3">
              {vehicleOwners.map((u) => (
                <PartnerCard key={u.id} user={u} onUpdateStatus={updateStatus} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-mint/20 text-mint",
  PENDING: "bg-amber/20 text-amber",
  REJECTED: "bg-coral/20 text-coral",
  SUSPENDED: "bg-ink/10 text-stone",
};

function PartnerCard({
  user,
  onUpdateStatus,
}: {
  user: PartnerUser;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const badgeColor = STATUS_COLORS[user.partnerStatus ?? ""] ?? "bg-ink/10 text-stone";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-black">
          {user.name ?? "—"}{" "}
          <span className="text-sm font-semibold text-stone">({user.role})</span>
        </p>
        <p className="text-sm text-stone break-all">{user.email} • {user.phone ?? "—"}</p>
        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-black uppercase ${badgeColor}`}>
          {user.partnerStatus ?? "—"}
        </span>
      </div>
      {user.partnerStatus !== "APPROVED" ? (
        <button
          onClick={() => onUpdateStatus(user.id, "APPROVED")}
          className="rounded-md bg-mint px-3 py-2 font-black text-ink"
        >
          Approve
        </button>
      ) : (
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onUpdateStatus(user.id, "SUSPENDED")}
            className="rounded-md border border-ink/15 px-3 py-2 font-black text-stone"
          >
            Suspend
          </button>
          <button
            onClick={() => onUpdateStatus(user.id, "REJECTED")}
            className="rounded-md border border-ink/15 px-3 py-2 font-black text-coral"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
