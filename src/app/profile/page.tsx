import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { SiteHeader } from "@/components/SiteHeader";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.sub,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-5 pt-28 pb-20">
        <div className="rounded-xl border border-ink/10 bg-white p-8 shadow-sm">

          <h1 className="text-4xl font-black">
            My Profile
          </h1>

          <p className="mt-2 text-stone">
            Manage your Road Track account.
          </p>

          <ProfileForm
  name={user.name ?? ""}
  email={user.email}
  phone={user.phone}
  role={user.role}
/>

        </div>
      </section>
    </main>
  );
}