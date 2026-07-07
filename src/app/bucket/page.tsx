import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import dynamic from "next/dynamic";
import { getSession } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/get-session-user";

const BucketContent = dynamic(() => import("@/components/BucketContent"), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
    </div>
  ),
});

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