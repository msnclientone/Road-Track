import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { SiteHeader } from "@/components/SiteHeader";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const headerUser = await getSessionUser();

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
      <SiteHeader user={headerUser} />

      <section className="mx-auto max-w-3xl px-5 pt-24 pb-20 sm:pt-28">
        <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm sm:p-8">

          <h1 className="text-3xl font-black sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-stone sm:text-base">
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