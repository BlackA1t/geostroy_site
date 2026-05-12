"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { ApiError } from "@/lib/api-error";
import { backendAdminGuestRequestsClient } from "@/lib/backend-admin-guest-requests-client";
import { backendAdminRequestsClient } from "@/lib/backend-admin-requests-client";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, type RequestStatus } from "@/lib/request-status";

type AdminStatusSelectProps = {
  currentStatus: RequestStatus;
  endpoint: string;
};

export function AdminStatusSelect({ currentStatus, endpoint }: AdminStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const id = endpoint.split("/").filter(Boolean).at(-1);

      if (!id) {
        throw new Error("Некорректный endpoint.");
      }

      if (endpoint.includes("/guest-requests/")) {
        await backendAdminGuestRequestsClient.updateAdminGuestRequestStatus(id, { status, comment });
      } else {
        await backendAdminRequestsClient.updateAdminRequestStatus(id, { status, comment });
      }

      setComment("");
      router.refresh();
    } catch (error) {
      setStatus(currentStatus);
      setError(error instanceof ApiError ? error.message : "Не удалось обновить статус.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-status-form" onSubmit={handleSubmit}>
      <label htmlFor="status">Статус заявки</label>
      <select
        id="status"
        value={status}
        disabled={isSaving}
        onChange={(event) => setStatus(event.target.value as RequestStatus)}
      >
        {REQUEST_STATUSES.map((item) => (
          <option key={item} value={item}>
            {REQUEST_STATUS_LABELS[item]}
          </option>
        ))}
      </select>
      <label htmlFor="admin-status-comment">Комментарий администратора (виден пользователю)</label>
      <textarea
        id="admin-status-comment"
        value={comment}
        maxLength={1000}
        disabled={isSaving}
        placeholder="Можно оставить пустым"
        onChange={(event) => setComment(event.target.value)}
      />
      <button className="btn btn-primary" type="submit" disabled={isSaving}>
        Сохранить статус
      </button>
      {isSaving ? <span>Сохранение...</span> : null}
      {error ? <div className="auth-error">{error}</div> : null}
    </form>
  );
}
