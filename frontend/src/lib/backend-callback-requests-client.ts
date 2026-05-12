import { apiClient } from "./api-client";

export type BackendCallbackStatus = "NEW" | "CONTACTED" | "CANCELLED";

export type BackendCallbackStatusHistoryItem = {
  id: string;
  callbackRequestId: string;
  oldStatus: BackendCallbackStatus | null;
  newStatus: BackendCallbackStatus;
  comment: string | null;
  changedById: string | null;
  createdAt: string;
  changedBy?: {
    name: string;
    email: string;
  } | null;
};

export type BackendCallbackRequestListItem = {
  id: string;
  callbackRequestNumber: number;
  name: string | null;
  phone: string;
  status: BackendCallbackStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: BackendCallbackStatusHistoryItem[];
};

export type BackendCallbackRequestDetails = BackendCallbackRequestListItem;

type CreateCallbackRequestPayload = {
  name?: string;
  phone: string;
};

type UpdateCallbackRequestPayload = {
  status?: BackendCallbackStatus;
  comment?: string;
};

type CreateCallbackRequestResponse = {
  success: true;
  callbackRequestId: string;
};

type UpdateCallbackRequestResponse = {
  callbackRequest: BackendCallbackRequestDetails;
  success: true;
};

export const backendCallbackRequestsClient = {
  createCallbackRequest(payload: CreateCallbackRequestPayload) {
    return apiClient.post<CreateCallbackRequestResponse>("/callback-requests", payload);
  },

  updateCallbackRequest(id: string, payload: UpdateCallbackRequestPayload) {
    return apiClient.patch<UpdateCallbackRequestResponse>(`/admin/callback-requests/${id}`, payload);
  }
};
