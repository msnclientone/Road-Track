"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNotice(data.error ?? "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setNotice("Unable to process your request right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-lg px-6 pb-24 pt-28">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-coral hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <h1 className="text-4xl font-black">Forgot password</h1>
            <p className="text-stone">
              Enter the email address associated with your account and we will
              send you a link to reset your password.
            </p>

            <label className="grid gap-2 text-sm font-black">
              Email address
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-white px-3 pl-11 text-base outline-none focus:border-coral"
                />
              </span>
            </label>

            <button
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-coral px-4 font-black text-ink transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Send reset link
            </button>

            {notice ? (
              <p className="rounded-md bg-mint/20 p-3 text-sm font-bold text-stone">
                {notice}
              </p>
            ) : null}
          </form>
        ) : (
          <div className="mt-8">
            <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-mint" />
              <h2 className="mt-4 text-2xl font-black">Check your inbox</h2>
              <p className="mt-3 text-stone">
                If an account exists with this email, a password reset link has
                been sent.
              </p>
              <p className="mt-2 text-sm text-stone">
                The link expires in 15 minutes.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-ink px-6 font-black text-white transition hover:bg-stone"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
