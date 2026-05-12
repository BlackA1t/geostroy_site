import { apiClient } from "./api-client";
import type { BackendRequestStatus } from "./backend-requests-client";

export type AdminRequestDetailsPayload = {
  serviceType: FormDataEntryValue | null;
  material: FormDataEntryValue | null;
  quantity: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  name: FormDataEntryValue | null;
  phone: string;
  email: string;
};

type StatusPayload = {
  status?: BackendRequestStatus;
  comment?: string;
};

type SuccessResponse = {
  success: true;
};

export const backendAdminRequestsClient = {
  updateAdminRequestStatus(id: string, payload: StatusPayload) {
    return apiClient.patch(`/admin/requests/${id}`, payload);
  },

  updateAdminRequestDetails(id: string, payload: AdminRequestDetailsPayload) {
    return apiClient.patch(`/admin/requests/${id}/details`, payload);
  },

  deleteAdminRequestFile(id: string, fileId: string) {
    return apiClient.delete<SuccessResponse>(`/admin/requests/${id}/files/${fileId}`);
  }
};
