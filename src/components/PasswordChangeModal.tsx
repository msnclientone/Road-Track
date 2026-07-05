"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";

type PasswordChangeModalProps = {
  onClose: () => void;
};

export default function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Unable to change password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch {
      setError("Unable to change password.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-mint" />
            <h2 className="mt-4 text-2xl font-black">Password updated</h2>
            <p className="mt-2 text-sm font-semibold text-stone">
              Your password has been changed successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-coral" />
          <h2 className="text-2xl font-black">Change your password</h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-stone">
          You are using a temporary password. Please set a new password to
          continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-black">
            Current Password
            <span className="relative">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type={showCurrent ? "text" : "password"}
                required
                className="h-11 w-full rounded-md border border-ink/15 bg-ivory px-3 pr-10 text-base outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-2.5 text-stone"
              >
                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-black">
            New Password
            <span className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                className="h-11 w-full rounded-md border border-ink/15 bg-ivory px-3 pr-10 text-base outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-2.5 text-stone"
              >
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-black">
            Confirm New Password
            <span className="relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                className="h-11 w-full rounded-md border border-ink/15 bg-ivory px-3 pr-10 text-base outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-2.5 text-stone"
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          {error ? (
            <p className="rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
