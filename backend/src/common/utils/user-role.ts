import { Role } from "@prisma/client";

export const USER_ROLES: Role[] = [Role.USER, Role.ADMIN];

export function isUserRole(value: unknown): value is Role {
  return typeof value === "string" && USER_ROLES.includes(value as Role);
}
