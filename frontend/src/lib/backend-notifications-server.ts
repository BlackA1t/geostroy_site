import { cookies } from "next/headers";
import { formatRequestTitle } from "./request-number";

export type BackendNotification = {
  id: string;
  title: string;
  displayTitle: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  requestId: string | null;
  request: {
    requestNumber: number;
  } | null;
};

type BackendNotificationResponse = {
  notifications: Array<Omit<BackendNotification, "displayTitle">>;
};

type BackendUnreadCountResponse = {
  count: number;
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

function withDisplayTitle(notification: Omit<BackendNotification, "displayTitle">): BackendNotification {
  return {
    ...notification,
    displayTitle: notification.request
      ? formatRequestTitle(notification.request.requestNumber)
      : notification.title
  };
}

async function backendGet<T>(path: string): Promise<T | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) return null;

  const response = await fetch(`${getBackendApiUrl()}${path}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader
    }
  });

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error(`Backend notifications request ${path} failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function getNotificationsFromBackend(): Promise<BackendNotification[]> {
  const response = await backendGet<BackendNotificationResponse>("/notifications");

  return response?.notifications.map(withDisplayTitle) ?? [];
}

export async function getRecentNotificationsFromBackend(): Promise<BackendNotification[]> {
  const response = await backendGet<BackendNotificationResponse>("/notifications/recent");

  return response?.notifications.map(withDisplayTitle) ?? [];
}

export async function getUnreadNotificationsCountFromBackend(): Promise<number> {
  const response = await backendGet<BackendUnreadCountResponse>("/notifications/unread-count");

  return response?.count ?? 0;
}
