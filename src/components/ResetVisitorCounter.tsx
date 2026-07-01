"use client";

import { useRouter } from "next/navigation";

export default function ResetVisitorCounter() {
  const router = useRouter();

  async function resetCounter() {
    const ok = window.confirm(
      "Reset visitor counter?"
    );

    if (!ok) return;

    const res = await fetch(
  "/api/analytics/reset",
  {
    method: "POST",
  }
);

    if (!res.ok) {
      alert("Unable to reset.");
      return;
    }

    alert("Visitor counter reset.");

    router.refresh();
  }

  return (
    <button
      onClick={resetCounter}
      className="rounded-xl bg-coral px-5 py-3 font-black text-white hover:bg-coral/90"
    >
      Reset Visitors
    </button>
  );
}