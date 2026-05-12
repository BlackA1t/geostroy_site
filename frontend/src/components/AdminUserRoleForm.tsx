"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api-error";
import { backendAdminUsersClient } from "@/lib/backend-admin-users-client";
import { USER_ROLE_OPTIONS, type Role } from "@/lib/user-role";

type AdminUserRoleFormProps = {
  currentRole: Role;
  userId: string;
};

export function AdminUserRoleForm({ currentRole, userId }: AdminUserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (role === currentRole) {
      setError("Роль не изменилась.");
      return;
    }

    setIsSaving(true);

    try {
      await backendAdminUsersClient.updateAdminUserRole(userId, role);

      setSuccess("Роль обновлена.");
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось изменить роль.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-status-form user-role-form" onSubmit={handleSubmit}>
      <label htmlFor="admin-user-role">Роль пользователя</label>
      <select
        id="admin-user-role"
        value={role}
        disabled={isSaving}
        onChange={(event) => setRole(event.target.value as Role)}
      >
        {USER_ROLE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить роль"}
      </button>
      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}
    </form>
  );
}
