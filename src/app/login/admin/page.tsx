import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth/get-session-user";

export default async function AdminLoginPage() {
  const headerUser = await getSessionUser();
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />
      <LoginForm portal="admin" />
    </main>
  );
}
