import Image from "next/image";
import Link from "next/link";

import { FaInstagram } from "react-icons/fa";
import {
  Building2,
  CarFront,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { emergencyPhone } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/utils";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-ink text-ivory">
      <div className="w-full border-b border-white/10 px-5 py-12 sm:px-8 lg:px-10 2xl:px-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/road-track-logo.jpeg"
              alt="Road Track logo"
              width={64}
              height={50}
              className="h-14 w-16 rounded-md bg-white object-contain p-1.5"
            />
            <span className="font-serif text-3xl max-md:text-2xl font-black tracking-tight">
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
      </div>

      <div className="w-full grid gap-5 px-5 py-6 text-sm text-white/65 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 2xl:px-12">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <a
  href="https://maps.app.goo.gl/65BizSW5tN7V2wP58?g_st=ac"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 transition-all duration-300 hover:text-coral hover:scale-105"
  aria-label="Road Track Office location on Google Maps"
>
  <MapPinned className="h-4 w-4 text-coral" />
  Road Track Office
</a>
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
  className="inline-flex items-center gap-2 transition-all duration-300 hover:text-coral hover:scale-105"
  aria-label="Road Track Instagram profile"
>
  <FaInstagram className="h-4 w-4 text-coral" />
  Instagram
</a>

          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-coral" />
            Verified local network
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
          <span>
            &copy; {year} RoadTrack Udupi. All Rights Reserved. Owned by
            RoadTrack Udupi.
          </span>
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

      <div className="w-full grid gap-3 border-t border-white/10 px-5 py-4 text-xs font-semibold text-white/45 sm:px-8 md:grid-cols-2 lg:px-10 2xl:px-12">
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


