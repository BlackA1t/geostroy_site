import { apiClient } from "./api-client";

type MarkReadResponse = {
  notification: unknown;
};

type MarkAllReadResponse = {
  success: boolean;
  count: number;
};

export const backendNotificationsClient = {
  markNotificationRead(id: string) {
    return apiClient.patch<MarkReadResponse>(`/notifications/${id}/read`);
  },

  markAllNotificationsRead() {
    return apiClient.patch<MarkAllReadResponse>("/notifications/read-all");
  }
};
