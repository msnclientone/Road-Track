"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";

type OwnerInfo = {
  name: string | null;
  phone: string | null;
  email: string | null;
  vehicleOwnerId?: string | null;
  resortOwnerId?: string | null;
};

type Enquiry = {
  id: string;
  enquiryId: string | null;
  customerName: string;
  customerPhone: string;
  source: string;
  status: string;
  createdAt: string;
  assignedVehicle: {
    id: string;
    vehicleType: string;
    registrationNo: string | null;
    destination: { name: string } | null;
    owner: OwnerInfo | null;
  } | null;
  assignedResort: {
    id: string;
    name: string;
    destination: { name: string } | null;
    owner: OwnerInfo | null;
  } | null;
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber/20 text-amber",
  CONFIRMED: "bg-mint/20 text-mint",
  CANCELLED: "bg-coral/20 text-coral",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const DISPLAY_LIMIT = 10;

export default function AdminEnquiries() {
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (selectedEnquiry) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedEnquiry(null);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [selectedEnquiry]);

  const fetchEnquiries = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/enquiries${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setAllEnquiries(data.enquiries ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const isSearchActive = searchQuery.trim().length > 0;
  const displayEnquiries = isSearchActive || showAll
    ? allEnquiries
    : allEnquiries.slice(0, DISPLAY_LIMIT);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    setShowAll(false);
    const timer = setTimeout(() => {
      fetchEnquiries(searchQuery.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchEnquiries]);

  async function handleDelete(enquiryId: string) {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setDeleteConfirmId(null);
      setSelectedEnquiry(null);
      setSuccessMsg("Enquiry deleted successfully.");
      fetchEnquiries(searchQuery.trim() || undefined);
    } catch (e: any) {
      alert(e?.message ?? "Unable to delete enquiry");
      setDeleteConfirmId(null);
    }
  }

  return (
    <section>
      {successMsg && (
        <div className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-black">Enquiries</h3>
        {allEnquiries.length > 0 && (
          <span className="text-sm font-semibold text-stone">
            {allEnquiries.length} total
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search Enquiry ID (ROADE...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-ink placeholder-stone/60 outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
        />
      </div>

      {loading && <p className="mt-6 text-sm text-stone">Loading enquiries...</p>}
      {error && <p className="mt-6 text-sm text-coral">{error}</p>}

      {!loading && !error && allEnquiries.length === 0 && (
        <p className="mt-6 text-sm text-stone">
          {searchQuery.trim()
            ? "No enquiries match your search."
            : "No enquiries yet."}
        </p>
      )}

      {!loading && !error && displayEnquiries.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-stone">
                <th className="pb-2 pr-4 font-bold">Enquiry ID</th>
                <th className="pb-2 pr-4 font-bold">Customer</th>
                <th className="pb-2 pr-4 font-bold">Type</th>
                <th className="pb-2 pr-4 font-bold">Date</th>
                <th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayEnquiries.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer border-b border-ink/5 transition hover:bg-ink/[0.02]"
                  onClick={() => setSelectedEnquiry(e)}
                >
                  <td className="py-3 pr-4 font-mono font-bold">{e.enquiryId ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold">{e.customerName}</span>
                  </td>
                  <td className="py-3 pr-4 text-stone">
                    {e.assignedVehicle ? "Vehicle" : e.assignedResort ? "Resort" : "General"}
                  </td>
                  <td className="py-3 pr-4 text-stone">
                    {formatDate(e.createdAt)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-black uppercase ${STATUS_COLORS[e.status] ?? "bg-ink/10 text-stone"}`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isSearchActive && allEnquiries.length > DISPLAY_LIMIT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 text-sm font-bold text-coral hover:underline"
            >
              {showAll ? "Show Less" : `View All (${allEnquiries.length})`}
            </button>
          )}
        </div>
      )}

      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">
                {selectedEnquiry.enquiryId ?? "Enquiry"}
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-bold transition hover:bg-ink/5"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h4 className="text-base font-black text-stone">Customer Details</h4>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone">Name</span>
                    <span className="font-semibold">{selectedEnquiry.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Phone</span>
                    <span className="font-semibold">{selectedEnquiry.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Source</span>
                    <span className="font-semibold">{selectedEnquiry.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Created</span>
                    <span className="font-semibold">{formatDate(selectedEnquiry.createdAt)}</span>
                  </div>
                </div>
              </section>

              {selectedEnquiry.assignedVehicle && (
                <section>
                  <h4 className="text-base font-black text-stone">Vehicle Details</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone">Type</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Registration</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.registrationNo || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Destination</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.destination?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Name</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.owner?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner ID</span>
                      <span className="font-mono font-semibold">{selectedEnquiry.assignedVehicle.owner?.vehicleOwnerId ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Phone</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.owner?.phone ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Email</span>
                      <span className="font-semibold">{selectedEnquiry.assignedVehicle.owner?.email ?? "—"}</span>
                    </div>
                  </div>
                </section>
              )}

              {selectedEnquiry.assignedResort && (
                <section>
                  <h4 className="text-base font-black text-stone">Resort Details</h4>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone">Name</span>
                      <span className="font-semibold">{selectedEnquiry.assignedResort.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Destination</span>
                      <span className="font-semibold">{selectedEnquiry.assignedResort.destination?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Name</span>
                      <span className="font-semibold">{selectedEnquiry.assignedResort.owner?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner ID</span>
                      <span className="font-mono font-semibold">{selectedEnquiry.assignedResort.owner?.resortOwnerId ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Phone</span>
                      <span className="font-semibold">{selectedEnquiry.assignedResort.owner?.phone ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone">Owner Email</span>
                      <span className="font-semibold">{selectedEnquiry.assignedResort.owner?.email ?? "—"}</span>
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-base font-black text-stone">Status</h4>
                <p className="mt-2 text-sm font-semibold">{selectedEnquiry.status}</p>
              </section>

              <hr className="border-ink/10" />
              <section>
                <button
                  onClick={() => setDeleteConfirmId(selectedEnquiry.id)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Enquiry
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black">Delete Enquiry?</h3>
            <p className="mt-3 text-sm font-semibold text-stone">
              Enquiry ID: {allEnquiries.find((e) => e.id === deleteConfirmId)?.enquiryId ?? "—"}
            </p>
            <p className="mt-1 text-sm text-stone">
              This action is permanent and cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-ink/15 px-4 py-2 text-sm font-bold transition hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
