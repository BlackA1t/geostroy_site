"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CALLBACK_STATUS_LABELS, CALLBACK_STATUSES, type CallbackStatus } from "@/lib/callback-status";

type AdminCallbackStatusSelectProps = {
  callbackRequestId: string;
  currentStatus: CallbackStatus;
};

export function AdminCallbackStatusSelect({ callbackRequestId, currentStatus }: AdminCallbackStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>(currentStatus);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextStatus: CallbackStatus) {
    setStatus(nextStatus);
    setError("");
    setIsSaving(true);

    const response = await fetch(`/api/admin/callback-requests/${callbackRequestId}`, {
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
    <div className="callback-status-control">
      <select
        aria-label="Статус обратного звонка"
        value={status}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.value as CallbackStatus)}
      >
        {CALLBACK_STATUSES.map((item) => (
          <option key={item} value={item}>
            {CALLBACK_STATUS_LABELS[item]}
          </option>
        ))}
      </select>
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}
