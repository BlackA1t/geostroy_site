export type Role = "USER" | "ADMIN";

export const USER_ROLE_LABELS: Record<Role, string> = {
  USER: "Пользователь",
  ADMIN: "Администратор"
};

export const USER_ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "USER", label: USER_ROLE_LABELS.USER },
  { value: "ADMIN", label: USER_ROLE_LABELS.ADMIN }
];

export function getUserRoleLabel(role: Role) {
  return USER_ROLE_LABELS[role];
}

export function getUserRoleClassName(role: Role) {
  return `user-role-${role.toLowerCase()}`;
}

export function isUserRole(value: unknown): value is Role {
  return value === "USER" || value === "ADMIN";
}
