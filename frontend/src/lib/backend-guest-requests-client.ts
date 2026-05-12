import { apiClient } from "./api-client";

export type BackendGuestRequestResult =
  | {
      type: "guest";
      message: string;
      guestRequestId: string;
    }
  | {
      type: "authenticated";
      message: string;
      requestId: string;
    };

export type PendingGuestRequestResponse = {
  guestRequest: {
    id: string;
    guestRequestNumber: number;
    createdAt: string;
    serviceType: string;
    status: string;
  } | null;
};

export type ClaimGuestRequestResponse = {
  request: {
    id: string;
  } | null;
};

export const backendGuestRequestsClient = {
  createGuestRequest(formData: FormData) {
    return apiClient.post<BackendGuestRequestResult>("/guest-requests", formData);
  },

  getPendingGuestRequest() {
    return apiClient.get<PendingGuestRequestResponse>("/guest-requests/pending");
  },

  claimGuestRequest() {
    return apiClient.post<ClaimGuestRequestResponse>("/guest-requests/claim");
  }
};
