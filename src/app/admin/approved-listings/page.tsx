import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SiteHeader } from "@/components/SiteHeader";
import AdminApprovedListings from "@/components/AdminApprovedListings";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminApprovedListingsPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login/admin");
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-none px-5 pb-20 pt-28 sm:px-8 lg:px-10 2xl:px-12">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Admin Panel
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
              Approved Listings
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone">
              View all approved resorts and vehicles with owner contact details. These listings are ready for customers to book.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <AdminApprovedListings />
        </div>
      </section>
    </main>
  );
}
