import { apiClient } from "./api-client";
import type { BackendUser } from "./backend-auth-client";

type UserResponse = {
  user: BackendUser;
};

type SuccessResponse = {
  success: true;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const backendUserClient = {
  getMe() {
    return apiClient.get<UserResponse>("/users/me");
  },

  updateMe(payload: UpdateProfilePayload) {
    return apiClient.patch<UserResponse>("/users/me", payload);
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiClient.patch<SuccessResponse>("/users/me/password", payload);
  }
};
