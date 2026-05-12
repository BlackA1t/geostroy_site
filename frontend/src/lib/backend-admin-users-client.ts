import { apiClient } from "./api-client";
import type { BackendUser } from "./backend-auth-client";

export type BackendUserRole = "USER" | "ADMIN";

type UpdateRoleResponse = {
  success: true;
  user: BackendUser;
};

export const backendAdminUsersClient = {
  updateAdminUserRole(id: string, role: BackendUserRole) {
    return apiClient.patch<UpdateRoleResponse>(`/admin/users/${id}/role`, { role });
  }
};
