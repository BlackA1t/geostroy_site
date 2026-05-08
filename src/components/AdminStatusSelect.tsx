"use client";

import { RequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES } from "@/lib/request-status";

type AdminStatusSelectProps = {
  currentStatus: RequestStatus;
  endpoint: string;
};

export function AdminStatusSelect({ currentStatus, endpoint }: AdminStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextStatus: RequestStatus) {
    setStatus(nextStatus);
    setError("");
    setIsSaving(true);

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });

    const result = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setStatus(currentStatus);
      setError(result?.error ?? "Не удалось обновить статус.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="admin-status-form">
      <label htmlFor="status">Статус заявки</label>
      <select
        id="status"
        value={status}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.value as RequestStatus)}
      >
        {REQUEST_STATUSES.map((item) => (
          <option key={item} value={item}>
            {REQUEST_STATUS_LABELS[item]}
          </option>
        ))}
      </select>
      {isSaving ? <span>Сохранение...</span> : null}
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}
