import type { Role } from "@prisma/client";

export type SafeUserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

type SafeUserInput = SafeUserResponse & {
  passwordHash?: string;
};

export function toSafeUser(user: SafeUserInput): SafeUserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
