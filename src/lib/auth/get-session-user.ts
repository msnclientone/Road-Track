import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export type HeaderUser = {
  name?: string;
  email: string;
  role?: string;
};

export async function getSessionUser(): Promise<HeaderUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true },
  });

  return {
    name: user?.name ?? undefined,
    email: session.email,
    role: session.role,
  };
}
