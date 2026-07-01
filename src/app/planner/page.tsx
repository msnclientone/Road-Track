import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EnquiryPlanner } from "@/components/EnquiryPlanner";

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 py-28">
        <h1 className="mb-10 text-5xl font-black">
          Trip Planner
        </h1>

        <EnquiryPlanner />
      </section>

      <SiteFooter />
    </main>
  );
}