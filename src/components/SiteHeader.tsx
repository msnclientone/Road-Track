"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import DestinationSearch from "@/components/DestinationSearch";

const navItems = [
  { href: "/#destinations", label: "Destinations" },
  { href: "/#resorts", label: "Resorts" },
  { href: "/#vehicles", label: "Vehicles" },
];

type Destination = {
  id: string;
  name: string;
  slug: string;
};

export function SiteHeader({
  destinations = [],
}: {
  destinations?: Destination[];
}) {
  const [user, setUser] = useState<{
  name?: string;
  email: string;
  role?: string;
} | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setUser(data.user ?? null);
        if (sessionStorage.getItem("justLoggedIn") === "true" && data.user) {
          sessionStorage.removeItem("justLoggedIn");
          setShowWelcome(true);
          welcomeTimer.current = setTimeout(() => {
            if (mounted) setShowWelcome(false);
          }, 3500);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
      if (welcomeTimer.current) clearTimeout(welcomeTimer.current);
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    drawer.addEventListener("keydown", trap);
    return () => drawer.removeEventListener("keydown", trap);
  }, [mobileMenuOpen]);

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
    <>
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
    Your Bucket List
    </Link>
  )}

  {user?.role === "SUPER_ADMIN" && (
    <Link
      href="/admin"
      className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-black text-ink transition hover:bg-coral/90"
    >
      <LayoutDashboard className="h-4 w-4" />
      Super Admin
    </Link>
  )}

  {destinations.length > 0 && (
    <DestinationSearch destinations={destinations} navbar />
  )}
</nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
  href="/profile"
  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition hover:bg-white/10 hover:text-coral"
>
   <User className="h-4 w-4" />
   {user.name ?? user.email}
</Link>
              {user.role === "SUPER_ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-md bg-coral px-3 py-2 text-sm font-black text-ink transition hover:bg-coral/90"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Super Admin
                </Link>
              )}
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

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-coral lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 animate-fade-in lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>

          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] animate-slide-in-left bg-ink shadow-2xl lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/road-track-logo.jpeg"
                    alt="Road Track logo"
                    width={44}
                    height={34}
                    className="h-10 w-12 rounded-md bg-white object-contain p-1"
                  />
                  <span className="font-serif text-xl font-black text-ivory">
                    Road Track
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-coral"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1 px-3 py-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex rounded-lg px-4 py-3 text-base font-bold text-white/85 transition hover:bg-white/10 hover:text-coral"
                  >
                    {item.label}
                  </Link>
                ))}

                {user?.role === "CUSTOMER" && (
                  <Link
                    href="/bucket"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex rounded-lg px-4 py-3 text-base font-bold text-white/85 transition hover:bg-white/10 hover:text-coral"
                  >
                    Your Bucket List
                  </Link>
                )}

                {user?.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-coral px-4 py-3 text-base font-black text-ink transition hover:bg-coral/90"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Super Admin
                  </Link>
                )}
              </nav>

              {/* Drawer Footer */}
              <div className="border-t border-white/10 px-3 py-6">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-bold text-white/85 transition hover:bg-white/10 hover:text-coral"
                    >
                      <User className="h-5 w-5" />
                      {user.name ?? user.email}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg border border-white/15 px-4 py-3 text-base font-bold text-white transition hover:border-coral hover:text-coral"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-base font-bold text-white transition hover:border-coral hover:text-coral"
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showWelcome && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-slide-down rounded-lg bg-ink px-6 py-3 text-ivory shadow-lg">
          <p className="text-center text-sm font-bold">
            {user?.name ? "Welcome back, " + user.name + "!" : "Welcome back!"}
          </p>
        </div>
      )}
    </>
  );
}
