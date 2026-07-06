import Link from "next/link";
import { CheckCircle2, FileText, Handshake, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth/get-session-user";

const sections = [
  {
    icon: <Handshake className="h-6 w-6" />,
    title: "Managed marketplace",
    text: "Road Track receives travel enquiries, verifies requirements, and coordinates with suitable resort or vehicle partners before a booking is confirmed.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Partner confirmation",
    text: "Prices, availability, pickup details, and final inclusions are confirmed after Road Track checks the assigned partner for the requested date and group size.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Customer responsibility",
    text: "Customers should provide accurate contact, headcount, date, and trip details so Road Track can prepare a useful response and avoid incorrect quotes.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Practical baseline",
    text: "These terms are a project baseline for the MVP and should be reviewed by a legal professional before commercial launch.",
  },
];

export default async function TermsPage() {
  const headerUser = await getSessionUser();
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
          Terms
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          Clear rules for enquiries, partner checks, and bookings.
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone">
          Road Track is designed as a controlled tourism marketplace. Enquiries
          are captured first, then the team coordinates with verified partners
          before any booking is treated as confirmed.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
            >
              <div className="text-coral">{section.icon}</div>
              <h2 className="mt-4 text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone">{section.text}</p>
            </article>
          ))}
        </div>

        <Link
          href="/privacy"
          className="mt-10 inline-flex h-12 items-center rounded-md bg-ink px-5 font-black text-white transition hover:bg-stone"
        >
          Review privacy policy
        </Link>
      </section>
    </main>
  );
}
