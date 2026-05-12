import { cookies } from "next/headers";
import type { BackendRequestDetails, BackendRequestListItem, BackendRequestStatus } from "./backend-requests-client";

type QueryValue = string | number | boolean | null | undefined;

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

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getBackendApiUrl()}${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function backendRequest<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  const cookieHeader = await getCookieHeader();
  const response = await fetch(buildUrl(path, query), {
    cache: "no-store",
    headers: cookieHeader
      ? {
          Cookie: cookieHeader
        }
      : undefined
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message || payload?.error || "Ошибка запроса";

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

export function getAdminRequestsFromBackend(params: { q?: string; status?: BackendRequestStatus | null }) {
  return backendRequest<{ requests: Array<BackendRequestListItem & { user: { name: string; email: string } | null }> }>(
    "/admin/requests",
    {
      q: params.q,
      status: params.status
    }
  );
}

export function getAdminRequestFromBackend(id: string) {
  return backendRequest<{
    request: BackendRequestDetails & {
      user: { name: string; email: string; phone: string | null } | null;
    };
  }>(`/admin/requests/${id}`);
}
