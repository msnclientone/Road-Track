import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/get-session-user";
import BucketContent from "@/components/BucketContent";

export default async function BucketPage() {
  const session = await getSession();

  if (!session || session.role !== "CUSTOMER") {
    redirect("/login");
  }

  const headerUser = await getSessionUser();

  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader user={headerUser} />

      <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <h1 className="text-4xl font-black sm:text-5xl">My Bucket</h1>

        <BucketContent />
      </section>

      <SiteFooter />
    </main>
  );
}