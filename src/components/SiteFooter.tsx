import Image from "next/image";
import Link from "next/link";

import type { ReactNode } from "react";
import {
  Building2,
  CarFront,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { emergencyPhone } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/utils";

const serviceLinks = [
  { href: "/#destinations", label: "Destinations" },
  { href: "/#resorts", label: "Resorts" },
  { href: "/#vehicles", label: "Tourist vehicles" },
];

const partnerLinks = [
  { href: "/login", label: "Customer login" },
  { href: "/login/admin", label: "Admin login" },
  { href: "/login/resort-owner", label: "Resort owner login" },
  { href: "/login/vehicle-owner", label: "Vehicle owner login" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const dbDestinations = await prisma.destination.findMany({
    where: { published: true },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <footer className="bg-ink text-ivory">
      <div className="border-b border-white/10 px-5 py-12 sm:px-8 lg:px-10 2xl:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/road-track-logo.jpeg"
                alt="Road Track logo"
                width={64}
                height={50}
                className="h-14 w-16 rounded-md bg-white object-contain p-1.5"
              />
              <span className="font-serif text-3xl font-black tracking-tight">
                Road Track
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              Verified resorts, tourist vehicles, Udupi destination planning,
              WhatsApp enquiries, and local travel support from one trusted
              platform.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl(
                  "Hello Road Track,\nI want help planning a Udupi trip.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-4 font-black text-ink transition hover:bg-mint/90"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${emergencyPhone.replace(/\s/g, "")}`}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 px-4 font-black text-white transition hover:border-coral hover:text-coral"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            </div>
          </div>

          <FooterColumn title="Explore">
            {serviceLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Destinations">
            {dbDestinations.map((destination) => (
              <FooterLink
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
              >
                {destination.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Account">
            {partnerLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-6 text-sm text-white/65 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 2xl:px-12">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="inline-flex items-center gap-2 transition hover:text-coral">
          <Link
  href="https://maps.app.goo.gl/65BizSW5tN7V2wP58?g_st=ac"
  target="_blank"
  rel="noopener noreferrer"
>
 📍 Road Track Office
</Link>
</div>
          <a
            href="mailto:roadtrack.udupi@gmail.com"
            className="inline-flex items-center gap-2 transition hover:text-coral"
          >
            <Mail className="h-4 w-4 text-coral" />
            roadtrack.udupi@gmail.com
          </a>

            <a
  href="https://www.instagram.com/road_track.udupi?igsh=NGN4OHZmZXJ0a2hz"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 transition hover:text-pink-500"
>
  📷 Instagram
</a>

          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-coral" />
            Verified local network
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
          <span>Copyright {year} Road Track</span>
          <Link href="/privacy" className="transition hover:text-coral">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-coral">
            Terms
          </Link>
          <Link href="/login" className="transition hover:text-coral">
            Login
          </Link>
        </div>
      </div>

      <div className="grid gap-3 border-t border-white/10 px-5 py-4 text-xs font-semibold text-white/45 sm:px-8 md:grid-cols-2 lg:px-10 2xl:px-12">
        <span className="inline-flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          Resort bookings are confirmed after partner availability checks.
        </span>
        <span className="inline-flex items-center gap-2 md:justify-end">
          <CarFront className="h-3.5 w-3.5" />
          Vehicle rates may vary by date, distance, and route plan.
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-coral">
        {title}
      </h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="w-fit text-sm font-bold text-white/70 transition hover:text-coral"
    >
      {children}
    </Link>
  );
}
