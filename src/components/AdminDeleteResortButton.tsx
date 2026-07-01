"use client";

import { useRouter } from "next/navigation";

export default function AdminDeleteResortButton({
  resortId,
}: {
  resortId: string;
}) {
  const router = useRouter();

  async function deleteResort() {
    const confirmed = window.confirm(
      "Delete this resort permanently?"
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/resorts/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resortId,
      }),
    });

    if (!res.ok) {
      alert("Failed to delete resort.");
      return;
    }

    alert("Resort deleted successfully.");

    router.refresh();
  }

  return (
    <button
      onClick={deleteResort}
      className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}