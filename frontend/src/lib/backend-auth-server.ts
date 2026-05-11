import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export type BackendRole = "USER" | "ADMIN";

export type BackendSafeUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: BackendRole;
  createdAt: Date;
  updatedAt: Date;
};

type BackendUserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: BackendRole;
    createdAt: string;
    updatedAt: string;
  };
};

function getBackendApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return apiUrl.replace(/\/+$/, "");
}

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function toSafeUser(response: BackendUserResponse): BackendSafeUser {
  return {
    ...response.user,
    createdAt: new Date(response.user.createdAt),
    updatedAt: new Date(response.user.updatedAt)
  };
}

export async function getBackendCurrentUser(): Promise<BackendSafeUser | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) return null;

  let response: Response;

  try {
    response = await fetch(`${getBackendApiUrl()}/auth/me`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to load current user from backend auth.", error);
      return null;
    }

    throw error;
  }

  if (response.status === 401) return null;

  if (!response.ok) {
    const error = new Error(`Backend auth /me failed with status ${response.status}.`);

    if (process.env.NODE_ENV === "development") {
      console.warn(error);
      return null;
    }

    throw error;
  }

  return toSafeUser((await response.json()) as BackendUserResponse);
}

export async function requireBackendUser() {
  const user = await getBackendCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireBackendAdmin() {
  const user = await requireBackendUser();

  if (user.role !== "ADMIN") {
    notFound();
  }

  return user;
}
