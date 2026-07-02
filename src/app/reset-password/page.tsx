"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
  ];

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!passwordsMatch) {
      setNotice("Passwords do not match.");
      return;
    }

    if (requirements.some((r) => !r.met)) {
      setNotice("Meet all password requirements before continuing.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNotice(data.error ?? "Unable to reset password.");
        return;
      }

      setSuccess(true);
    } catch {
      setNotice("Unable to reset your password right now.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-8">
        <div className="rounded-2xl border border-mint/30 bg-mint/10 p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-12 w-12 text-mint" />
          <h2 className="mt-4 text-2xl font-black">Password reset complete</h2>
          <p className="mt-3 text-stone">
            Your password has been updated successfully. You can now sign in
            with your new password.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-ink px-6 font-black text-white transition hover:bg-stone"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      <h1 className="text-4xl font-black">Set new password</h1>
      <p className="text-stone">
        Choose a strong password for your Road&nbsp;Track account.
      </p>

      <label className="grid gap-2 text-sm font-black">
        New password
        <span className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="h-12 w-full rounded-md border border-ink/15 bg-white px-3 pl-11 text-base outline-none focus:border-coral"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-3.5 h-5 w-5 text-stone"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </span>
      </label>

      <div className="grid gap-2">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2 text-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                req.met ? "bg-mint" : "bg-stone/30"
              }`}
            />
            <span className={req.met ? "font-semibold text-ink" : "text-stone"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      <label className="grid gap-2 text-sm font-black">
        Confirm new password
        <span className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="h-12 w-full rounded-md border border-ink/15 bg-white px-3 pl-11 text-base outline-none focus:border-coral"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-3.5 h-5 w-5 text-stone"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </span>
        {confirmPassword.length > 0 ? (
          <span
            className={`text-xs font-semibold ${
              passwordsMatch ? "text-mint" : "text-coral"
            }`}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </span>
        ) : null}
      </label>

      <button
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-4 font-black text-ink transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-5 w-5" />
        )}
        Reset password
      </button>

      {notice ? (
        <p className="rounded-md bg-mint/20 p-3 text-sm font-bold text-stone">
          {notice}
        </p>
      ) : null}

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-bold text-coral hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </form>
  );
}

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-lg px-6 pb-24 pt-28">
        {!token ? (
          <div className="mt-8 rounded-2xl border border-coral/30 bg-coral/10 p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-coral" />
            <h2 className="mt-4 text-2xl font-black">Invalid reset link</h2>
            <p className="mt-3 text-stone">
              This reset link is missing or invalid. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-coral px-6 font-black text-ink transition hover:bg-coral/90"
            >
              Request new link
            </Link>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </section>
    </main>
  );
}
