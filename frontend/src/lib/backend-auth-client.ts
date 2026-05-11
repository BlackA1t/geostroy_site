import { apiClient } from "./api-client";

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type AuthUserResponse = {
  user: BackendUser;
};

type LogoutResponse = {
  success: true;
};

export const backendAuthClient = {
  register(payload: RegisterPayload) {
    return apiClient.post<AuthUserResponse>("/auth/register", payload, {
      skipAuthRefresh: true
    });
  },

  login(payload: LoginPayload) {
    return apiClient.post<AuthUserResponse>("/auth/login", payload, {
      skipAuthRefresh: true
    });
  },

  me() {
    return apiClient.get<AuthUserResponse>("/auth/me");
  },

  refresh() {
    return apiClient.post<AuthUserResponse>("/auth/refresh", undefined, {
      skipAuthRefresh: true
    });
  },

  logout() {
    return apiClient.post<LogoutResponse>("/auth/logout", undefined, {
      skipAuthRefresh: true
    });
  }
};
