"use client";

import { useEffect, useState, useCallback } from "react";
import { convertToDirectImageUrl, isGoogleDriveUrl, isValidImageUrl, verifyImageAccessible } from "@/lib/placeholders";

interface TripNote {
  id: string;
  title: string;
  description: string | null;
  price: number;
  totalKm: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  title: "",
  description: "",
  price: "99",
  totalKm: "",
  imageUrl: "",
  isActive: true,
};

export default function AdminTripNoteManager() {
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrlError, setImageUrlError] = useState("");

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/trip-notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  function getImagePreviewUrl(url: string): string {
    if (!url.trim()) return "";
    if (isGoogleDriveUrl(url)) return convertToDirectImageUrl(url);
    if (isValidImageUrl(url)) return url;
    return "";
  }

  function handleImageUrlChange(value: string) {
    setForm({ ...form, imageUrl: value });
    if (!value.trim()) {
      setImageUrlError("");
      return;
    }
    if (isGoogleDriveUrl(value)) {
      setImageUrlError("");
      return;
    }
    if (!isValidImageUrl(value)) {
      setImageUrlError("Please enter a valid image URL. Google Drive sharing links are supported.");
      return;
    }
    setImageUrlError("");
  }

  function editNote(note: TripNote) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      description: note.description ?? "",
      price: note.price.toString(),
      totalKm: note.totalKm.toString(),
      imageUrl: note.imageUrl,
      isActive: note.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setImageUrlError("");
  }

  async function saveNote() {
    if (!form.title.trim() || !form.imageUrl.trim() || !form.totalKm) {
      alert("Trip Name, Image URL, and Total KM are required.");
      return;
    }

    let resolvedImageUrl = form.imageUrl;
    if (isGoogleDriveUrl(form.imageUrl)) {
      resolvedImageUrl = convertToDirectImageUrl(form.imageUrl);
      const accessible = await verifyImageAccessible(resolvedImageUrl);
      if (!accessible) {
        alert("This Google Drive image is not publicly accessible. Please make the file public.");
        return;
      }
    } else if (!isValidImageUrl(form.imageUrl)) {
      alert("Please enter a valid direct image URL. Search engine image links are not supported.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price) || 99,
        totalKm: Number(form.totalKm),
        imageUrl: resolvedImageUrl,
        isActive: form.isActive,
      };

      const res = await fetch(
        editingId ? `/api/admin/trip-notes/${editingId}` : "/api/admin/trip-notes",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        alert(err.error || "Failed to save");
        return;
      }

      cancelEdit();
      await loadNotes();
    } catch {
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    if (!window.confirm("Delete this trip note?")) return;

    try {
      const res = await fetch(`/api/admin/trip-notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete");
        return;
      }
      await loadNotes();
    } catch {
      alert("An unexpected error occurred");
    }
  }

  async function toggleActive(note: TripNote) {
    try {
      const res = await fetch(`/api/admin/trip-notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !note.isActive }),
      });

      if (!res.ok) {
        alert("Failed to update");
        return;
      }

      await loadNotes();
    } catch {
      alert("An unexpected error occurred");
    }
  }

  return (
    <section className="rounded-3xl border bg-white p-8 max-md:p-5 shadow-sm">
      <h2 className="text-3xl max-md:text-2xl font-black">Trip Notes</h2>
      <p className="mt-2 text-stone">
        Manage promotional one-day trip notes shown on the homepage.
      </p>

      {/* Form */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Trip Name *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-xl border border-ink/10 bg-ivory p-3 font-bold focus:outline-none focus:ring-2 focus:ring-coral"
        />
        <input
          type="number"
          placeholder="Price (default ₹99)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-xl border border-ink/10 bg-ivory p-3 font-bold focus:outline-none focus:ring-2 focus:ring-coral"
        />
        <input
          type="number"
          placeholder="Total KM *"
          value={form.totalKm}
          onChange={(e) => setForm({ ...form, totalKm: e.target.value })}
          className="rounded-xl border border-ink/10 bg-ivory p-3 font-bold focus:outline-none focus:ring-2 focus:ring-coral"
        />
        <div className="sm:col-span-2">
          <input
            placeholder="Image URL * (paste Google Drive link or direct URL)"
            value={form.imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-ivory p-3 font-bold focus:outline-none focus:ring-2 focus:ring-coral"
          />
          {imageUrlError && (
            <p className="mt-1 text-sm text-red-500">{imageUrlError}</p>
          )}
          {form.imageUrl.trim() && !imageUrlError && getImagePreviewUrl(form.imageUrl) && (
            <div className="mt-2 overflow-hidden rounded-xl border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImagePreviewUrl(form.imageUrl)}
                alt="Preview"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
        <textarea
          placeholder="Description (max 200 chars, optional)"
          maxLength={200}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-xl border border-ink/10 bg-ivory p-3 font-bold focus:outline-none focus:ring-2 focus:ring-coral sm:col-span-2"
          rows={2}
        />
        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          Active (shown on homepage)
        </label>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={saveNote}
          disabled={saving}
          className="rounded-xl bg-coral px-6 py-3 font-black text-ink transition hover:scale-105 disabled:opacity-50"
        >
          {saving ? "Saving..." : editingId ? "Update Note" : "Create Note"}
        </button>
        {editingId && (
          <button
            onClick={cancelEdit}
            className="rounded-xl border border-ink/20 px-6 py-3 font-black transition hover:bg-ink hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-stone">
              <th className="pb-3 font-bold">Image</th>
              <th className="pb-3 font-bold">Trip Name</th>
              <th className="pb-3 font-bold">Price</th>
              <th className="pb-3 font-bold">KM</th>
              <th className="pb-3 font-bold">Status</th>
              <th className="pb-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id} className="border-b border-ink/5">
                <td className="py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={note.imageUrl}
                      alt={note.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 font-black">{note.title}</td>
                <td className="py-3 font-bold text-coral">₹{note.price}</td>
                <td className="py-3 font-bold">{note.totalKm} KM</td>
                <td className="py-3">
                  <button
                    onClick={() => toggleActive(note)}
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      note.isActive
                        ? "bg-mint/15 text-mint"
                        : "bg-stone/10 text-stone"
                    }`}
                  >
                    {note.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editNote(note)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notes.length === 0 && (
          <p className="py-8 text-center text-stone">No trip notes yet.</p>
        )}
      </div>
    </section>
  );
}
