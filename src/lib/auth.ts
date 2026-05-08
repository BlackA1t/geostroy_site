import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSessionToken, hashSessionToken } from "./session";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = await getSessionToken();

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id
        }
      });
    }

    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
