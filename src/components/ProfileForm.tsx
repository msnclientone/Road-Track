"use client";

import { useState } from "react";

type Props = {
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

export default function ProfileForm({
  name: initialName,
  email,
  phone: initialPhone,
  role,
}: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function saveProfile() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setMessage("❌ Failed to update profile.");
      return;
    }

    setMessage("✅ Profile updated successfully.");
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <p className="text-sm font-bold text-stone">
          Full Name
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded border p-3"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-stone">
          Email
        </p>

        <input
          value={email}
          disabled
          className="mt-2 w-full rounded border bg-gray-100 p-3"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-stone">
          Phone
        </p>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded border p-3"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-stone">
          Role
        </p>

        <input
          value={role}
          disabled
          className="mt-2 w-full rounded border bg-gray-100 p-3"
        />
      </div>

      <button
        onClick={saveProfile}
        disabled={loading}
        className="w-full rounded bg-coral px-6 py-3 font-bold text-white hover:bg-coral/90 disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {message && (
        <p className="font-bold">
          {message}
        </p>
      )}
    </div>
  );
}