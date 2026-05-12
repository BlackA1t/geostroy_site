import { apiClient } from "./api-client";
import type { BackendRequestStatus } from "./backend-requests-client";
import type { AdminRequestDetailsPayload } from "./backend-admin-requests-client";

type StatusPayload = {
  status?: BackendRequestStatus;
  comment?: string;
};

type SuccessResponse = {
  success: true;
};

export const backendAdminGuestRequestsClient = {
  updateAdminGuestRequestStatus(id: string, payload: StatusPayload) {
    return apiClient.patch(`/admin/guest-requests/${id}`, payload);
  },

  updateAdminGuestRequestDetails(id: string, payload: AdminRequestDetailsPayload) {
    return apiClient.patch(`/admin/guest-requests/${id}/details`, payload);
  },

  deleteAdminGuestRequestFile(id: string, fileId: string) {
    return apiClient.delete<SuccessResponse>(`/admin/guest-requests/${id}/files/${fileId}`);
  }
};
