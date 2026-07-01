"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, MessageCircle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { buildWhatsAppUrl } from "@/lib/utils";

const navItems = [
  { href: "/#destinations", label: "Destinations" },
  { href: "/#resorts", label: "Resorts" },
  { href: "/#vehicles", label: "Vehicles" },
  { href: "/#packages", label: "Packages" },
];

export function SiteHeader() {
  const [user, setUser] = useState<{
  name?: string;
  email: string;
  role?: string;
} | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setUser(data.user ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      setUser(null);
      // reload to update protected UI
      window.location.href = "/";
    } catch {
      // ignore
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/80 text-ivory backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-none items-center justify-between px-5 sm:px-8 lg:px-10 2xl:px-12">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/road-track-logo.jpeg"
            alt="Road Track logo"
            width={56}
            height={44}
            priority
            className="h-12 w-14 rounded-md bg-white object-contain p-1"
          />
          <span className="font-serif text-2xl font-black tracking-tight">
            Road Track
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-base font-bold text-white/85 lg:flex">
  {navItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className="hover:text-coral"
    >
      {item.label}
    </Link>
  ))}

  {user?.role === "CUSTOMER" && (
    <Link
      href="/bucket"
      className="hover:text-coral"
    >
      🪣 Bucket
    </Link>
  )}
</nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
  href="/profile"
  className="rounded-md px-3 py-2 text-sm font-bold transition hover:bg-white/10 hover:text-coral"
>
  👤 {user.name ?? user.email}
</Link>
              <button
                onClick={handleLogout}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 px-4 text-base font-bold text-white transition hover:border-coral hover:text-coral"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-11 items-center gap-2 rounded-md border border-white/15 px-4 text-base font-bold text-white transition hover:border-coral hover:text-coral sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}

          <a
            href={buildWhatsAppUrl(
              "Hello Road Track,\nI want help planning a Udupi trip.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-4 text-base font-black text-ink transition hover:bg-mint/90"
          >
            <MessageCircle className="h-4 w-4" />
            Enquire
          </a>
        </div>
      </div>
    </header>
  );
}
