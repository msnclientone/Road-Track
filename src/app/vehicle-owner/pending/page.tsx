import Link from "next/link";
import { Clock3, ShieldAlert } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth/get-session-user";

export default async function VehicleOwnerPendingPage() {
  const headerUser = await getSessionUser();
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />
      <section className="mx-auto max-w-2xl px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <div className="rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
          <ShieldAlert className="h-10 w-10 text-coral" />
          <h1 className="mt-4 text-4xl font-black">Approval pending</h1>
          <p className="mt-4 text-lg leading-8 text-stone">
            Your vehicle owner account is signed in, but Super Admin approval is
            still required before you can manage fleet availability or view
            assigned leads.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-md bg-coral/15 p-4 text-sm font-semibold text-stone">
            <Clock3 className="h-5 w-5 shrink-0 text-coral" />
            Road Track will notify you by email once your partner status is
            approved.
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-ink px-5 font-black text-white transition hover:bg-stone"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
