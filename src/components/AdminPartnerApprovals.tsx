"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

type PartnerUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  partnerStatus: string | null;
  vehicleOwnerId: string | null;
  resortOwnerId: string | null;
  createdAt: string;
};

const INITIAL_DISPLAY_COUNT = 3;

function getOwnerId(user: PartnerUser): string | null {
  if (user.role === "VEHICLE_OWNER") return user.vehicleOwnerId;
  if (user.role === "RESORT_OWNER") return user.resortOwnerId;
  return null;
}

export default function AdminPartnerApprovals() {
  const [users, setUsers] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

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

  const query = searchQuery.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query) return users;
    return users.filter((u) => {
      const ownerId = getOwnerId(u);
      return (
        u.name?.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        ownerId?.toLowerCase().includes(query)
      );
    });
  }, [users, query]);

  const visible = useMemo(() => {
    if (query) return filtered;
    return showAll ? filtered : filtered.slice(0, INITIAL_DISPLAY_COUNT);
  }, [filtered, query, showAll]);

  const resortOwners = visible.filter((u) => u.role === "RESORT_OWNER");
  const vehicleOwners = visible.filter((u) => u.role === "VEHICLE_OWNER");
  const totalCount = users.length;
  const hasMore = totalCount > INITIAL_DISPLAY_COUNT;

  if (loading) return <div>Loading partners…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-black">Registered Partners</h3>
        {totalCount > 0 && (
          <span className="text-sm font-semibold text-stone">
            {totalCount} total
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <input
            type="text"
            placeholder="Search by Owner Name, RoadTrack ID or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-ink placeholder-stone/60 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-stone">
          {query ? "No partners match your search." : "No registered partners."}
        </p>
      ) : (
        <div className="mt-4 grid gap-6">
          {resortOwners.length > 0 && (
            <div>
              <h4 className="text-lg font-black text-stone">Resort Owners ({resortOwners.length})</h4>
              <div className="mt-2 grid gap-3">
                {resortOwners.map((u) => (
                  <PartnerCard key={u.id} user={u} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </div>
          )}
          {vehicleOwners.length > 0 && (
            <div>
              <h4 className="text-lg font-black text-stone">Vehicle Owners ({vehicleOwners.length})</h4>
              <div className="mt-2 grid gap-3">
                {vehicleOwners.map((u) => (
                  <PartnerCard key={u.id} user={u} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </div>
          )}
          {!query && hasMore && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mx-auto mt-2 inline-flex items-center gap-2 rounded-xl border border-ink/15 px-5 py-2.5 font-black text-ink transition hover:bg-ink/5"
            >
              {showAll ? "Show Less" : `View All Partners (${totalCount})`}
            </button>
          )}
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
  const ownerId = getOwnerId(user);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-black">
          {user.name ?? "—"}{" "}
          <span className="text-sm font-semibold text-stone">({user.role})</span>
        </p>
        <p className="text-sm text-stone/60">
          {ownerId && <span className="font-mono font-semibold">{ownerId}</span>}
          {ownerId && <span className="mx-1.5">•</span>}
          <span>{user.email}</span>
          {user.phone && <span className="mx-1.5">•</span>}
          {user.phone && <span>{user.phone}</span>}
        </p>
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
