import { cookies } from "next/headers";

export type AdminOverview = {
  newRequestCount: number;
  newActiveGuestRequestCount: number;
  newCallbackRequestCount: number;
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

export async function getAdminOverviewFromBackend(): Promise<AdminOverview> {
  const cookieHeader = await getCookieHeader();
  const response = await fetch(`${getBackendApiUrl()}/admin/overview`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader
    }
  });

  if (!response.ok) {
    throw new Error(`Backend admin overview failed with status ${response.status}.`);
  }

  return (await response.json()) as AdminOverview;
}
