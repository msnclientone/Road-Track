import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import dynamic from "next/dynamic";
import { getSessionUser } from "@/lib/auth/get-session-user";

const EnquiryPlanner = dynamic(
  () => import("@/components/EnquiryPlanner").then((mod) => mod.EnquiryPlanner),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-stone/20" />
        <div className="h-64 animate-pulse rounded-xl bg-stone/20" />
        <div className="h-64 animate-pulse rounded-xl bg-stone/20" />
      </div>
    ),
  }
);

export default async function PlannerPage() {
  const headerUser = await getSessionUser();
  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader user={headerUser} />

      <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <h1 className="mb-8 text-4xl max-md:text-3xl font-black sm:mb-10 sm:text-5xl">
          Trip Planner
        </h1>

        <EnquiryPlanner />
      </section>

      <SiteFooter />
    </main>
  );
}