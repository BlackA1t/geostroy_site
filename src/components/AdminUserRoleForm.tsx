"use client";

import type { Role } from "@prisma/client";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { USER_ROLE_OPTIONS } from "@/lib/user-role";

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

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role })
    });

    const result = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось изменить роль.");
      return;
    }

    setSuccess("Роль обновлена.");
    router.refresh();
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
