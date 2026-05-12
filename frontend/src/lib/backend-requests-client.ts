import { apiClient } from "./api-client";

export type BackendRequestStatus = "NEW" | "NEED_INFO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type BackendRequestFile = {
  id: string;
  requestId: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  originalName: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export type BackendRequestStatusHistoryItem = {
  id: string;
  requestId: string | null;
  guestRequestId: string | null;
  oldStatus: BackendRequestStatus | null;
  newStatus: BackendRequestStatus;
  comment: string | null;
  changedById: string | null;
  actorType: string;
  createdAt: string;
  changedBy?: {
    name: string;
    email: string;
  } | null;
};

export type BackendRequestListItem = {
  id: string;
  requestNumber: number;
  userId: string | null;
  name: string;
  phone: string;
  email: string | null;
  serviceType: string;
  material: string | null;
  quantity: string | null;
  description: string;
  status: BackendRequestStatus;
  createdAt: string;
  updatedAt: string;
  _count: {
    files: number;
  };
};

export type BackendRequestDetails = BackendRequestListItem & {
  files: BackendRequestFile[];
  statusHistory: BackendRequestStatusHistoryItem[];
};

type RequestsListResponse = {
  requests: BackendRequestListItem[];
};

type RequestResponse = {
  request: BackendRequestDetails;
};

type SuccessResponse = {
  success: true;
};

export const backendRequestsClient = {
  getMyRequests(query?: { q?: string; status?: string | null }) {
    return apiClient.get<RequestsListResponse>("/requests", {
      query: {
        q: query?.q,
        status: query?.status
      }
    });
  },

  createRequest(formData: FormData) {
    return apiClient.post<RequestResponse>("/requests", formData);
  },

  getMyRequest(id: string) {
    return apiClient.get<RequestResponse>(`/requests/${id}`);
  },

  updateRequest(id: string, formData: FormData) {
    return apiClient.patch<RequestResponse>(`/requests/${id}`, formData);
  },

  deleteRequestFile(requestId: string, fileId: string) {
    return apiClient.delete<SuccessResponse>(`/requests/${requestId}/files/${fileId}`);
  }
};
