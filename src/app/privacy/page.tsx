import { Database, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth/get-session-user";

const sections = [
  {
    icon: <Database className="h-6 w-6" />,
    title: "Minimal data collection",
    text: "Road Track collects only the details required to answer travel enquiries: name, phone, email, destination, date, people count, resort preference, and vehicle preference.",
  },
  {
    icon: <LockKeyhole className="h-6 w-6" />,
    title: "Secure storage",
    text: "Production data should be stored in a private PostgreSQL database with row-level access, encrypted backups, and no public database access.",
  },
  {
    icon: <MailCheck className="h-6 w-6" />,
    title: "OTP email",
    text: "Email OTP is used for customer login. OTPs should expire after 5 minutes and resend attempts should be rate limited.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Partner visibility",
    text: "Resort and vehicle owners should see only leads assigned to them by Road Track. Admin controls partner approvals and pricing visibility.",
  },
];

export default async function PrivacyPage() {
  const headerUser = await getSessionUser();
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
          Privacy Policy
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          Keep tourism data focused, private, and useful.
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone">
          This MVP privacy page is written as a practical project baseline. It
          should be reviewed by a legal professional before commercial launch.
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
      </section>
    </main>
  );
}
