import { cookies } from "next/headers";
import type { BackendRequestFile, BackendRequestStatus, BackendRequestStatusHistoryItem } from "./backend-requests-client";

type QueryValue = string | number | boolean | null | undefined;

export type BackendAdminGuestRequestListItem = {
  id: string;
  guestRequestNumber: number;
  name: string;
  phone: string;
  email: string | null;
  serviceType: string;
  material: string | null;
  quantity: string | null;
  description: string;
  status: BackendRequestStatus;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    files: number;
  };
};

export type BackendAdminGuestRequestDetails = Omit<BackendAdminGuestRequestListItem, "_count"> & {
  claimedById: string | null;
  convertedRequestId: string | null;
  files: BackendRequestFile[];
  statusHistory: BackendRequestStatusHistoryItem[];
  claimedBy: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  convertedRequest: {
    requestNumber: number;
  } | null;
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

export function getAdminGuestRequestsFromBackend(params: { q?: string; status?: BackendRequestStatus | null }) {
  return backendRequest<{ guestRequests: BackendAdminGuestRequestListItem[] }>("/admin/guest-requests", {
    q: params.q,
    status: params.status
  });
}

export function getAdminGuestRequestFromBackend(id: string) {
  return backendRequest<{ guestRequest: BackendAdminGuestRequestDetails }>(`/admin/guest-requests/${id}`);
}
