"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export default function CreateSuperAdminPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/create-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setMessage("Super admin created. Redirecting...");
      window.location.href = data.redirectTo || "/admin";
    } catch (err: any) {
      setMessage(err?.message || "Error creating account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-md px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <h1 className="text-3xl font-black">Create Super Admin</h1>
        <p className="mt-2 text-sm text-stone">
          Use this form to create a Road Track super admin. If one already exists,
          you must be signed in as a super admin to use this.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-ink/10 bg-white px-4 py-3"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-ink/10 bg-white px-4 py-3"
          />
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-md border border-ink/10 bg-white px-4 py-3"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-ink/10 bg-white px-4 py-3"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3 h-5 w-5 text-stone"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <div className="relative">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-md border border-ink/10 bg-white px-4 py-3"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-3 top-3 h-5 w-5 text-stone"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <label className="inline-flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
            />
            <span className="text-sm text-stone">I accept Terms and Privacy</span>
          </label>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create Super Admin"}
            </button>
            {message && <p className="mt-3 text-sm text-coral">{message}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
