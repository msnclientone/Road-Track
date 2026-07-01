"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Resort {
  id: string;
  name: string;
  owner: { name?: string; email: string } | null;
  priceMin: number;
  priceMax: number;
  googleMapsLink?: string | null;
}

export default function AdminResortApprovals() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [approving, setApproving] = useState<Resort | null>(null);
  const [acPrice, setAcPrice] = useState("");
  const [nonAcPrice, setNonAcPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const nonAcRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (approving && nonAcRef.current) {
      nonAcRef.current.focus();
    }
  }, [approving]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && approving) {
        closeApprovalModal();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [approving]);

  function openApprovalModal(r: Resort) {
    setApproving(r);
    setAcPrice("");
    setNonAcPrice("");
    setValidationError(null);
    setSubmitting(false);
  }

  function closeApprovalModal() {
    setApproving(null);
  }

  async function handleApprove() {
    if (!approving) return;

    const ac = Number(acPrice);
    const nonAc = Number(nonAcPrice);

    if (!acPrice.trim() || !nonAcPrice.trim()) {
      setValidationError("Both AC and Non-AC prices are required.");
      return;
    }

    if (ac <= 0 || nonAc <= 0) {
      setValidationError("Prices must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch("/api/admin/resorts/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resortId: approving.id,
          status: "APPROVED",
          nonAcPrice: nonAc,
          acPrice: ac,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to approve resort");
      }

      setResorts((old) => old.filter((r) => r.id !== approving.id));
      closeApprovalModal();
    } catch (e: any) {
      setValidationError(e?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function rejectResort(resortId: string) {
    try {
      const res = await fetch("/api/admin/resorts/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId, status: "REJECTED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResorts((old) => old.filter((r) => r.id !== resortId));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function deleteResort(resortId: string) {
    if (!confirm("Delete this resort permanently?")) return;

    try {
      const res = await fetch("/api/admin/resorts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResorts((old) => old.filter((r) => r.id !== resortId));
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (loading) return <div>Loading pending resorts…</div>;
  if (error) return <div className="text-coral">{error}</div>;

  return (
    <div>
      <style>{`
        @keyframes overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-overlay { animation: overlay-in 0.2s ease-out; }
        .modal-card { animation: modal-in 0.25s ease-out; }
      `}</style>

      <h4 className="text-lg font-black">Resort submissions</h4>
      {resorts.length === 0 ? (
        <p className="mt-2 text-sm text-stone">No pending resorts.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {resorts.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-md border border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-black">{r.name}</p>
                <p className="text-sm text-stone">
                  Owner: {r.owner?.name ?? r.owner?.email}
                </p>
                <p className="text-sm text-stone">
                  Non AC Price :
                  <span className="font-semibold"> ₹{r.priceMin}</span>
                </p>
                <p className="text-sm text-stone">
                  AC Price :
                  <span className="font-semibold"> ₹{r.priceMax}</span>
                </p>
                {r.googleMapsLink && (
                  <a
                    href={r.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-coral hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    View Location
                  </a>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => openApprovalModal(r)}
                  className="rounded-md bg-mint px-3 py-2 font-black text-ink"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectResort(r.id)}
                  className="rounded-md border border-ink/15 px-3 py-2 font-black text-stone"
                >
                  Reject
                </button>

                <button
                  onClick={() => deleteResort(r.id)}
                  className="rounded-md bg-red-600 px-3 py-2 font-black text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {approving && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeApprovalModal}
        >
          <div
            className="modal-card w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">Approve Resort</h3>

            <div className="mt-4">
              <label className="text-sm font-bold text-stone">Resort Name</label>
              <p className="mt-1 rounded-lg bg-stone-50 px-4 py-3 font-semibold">
                {approving.name}
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="nonAcPrice"
                className="text-sm font-bold text-stone"
              >
                Non-AC Room Price (₹)
              </label>
              <input
                ref={nonAcRef}
                id="nonAcPrice"
                type="number"
                min="1"
                step="1"
                value={nonAcPrice}
                onChange={(e) => setNonAcPrice(e.target.value)}
                placeholder="Enter non-AC room price"
                className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="acPrice" className="text-sm font-bold text-stone">
                AC Room Price (₹)
              </label>
              <input
                id="acPrice"
                type="number"
                min="1"
                step="1"
                value={acPrice}
                onChange={(e) => setAcPrice(e.target.value)}
                placeholder="Enter AC room price"
                className="mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {validationError && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {validationError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeApprovalModal}
                disabled={submitting}
                className="flex-1 rounded-lg border border-ink/15 px-4 py-3 font-bold text-stone transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 rounded-lg bg-coral px-4 py-3 font-black text-ink transition hover:bg-coral/90 disabled:opacity-60"
              >
                {submitting ? "Approving…" : "Approve Resort"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
