"use client";

import type { CallbackStatus } from "@prisma/client";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CALLBACK_STATUS_OPTIONS } from "@/lib/callback-status";

type AdminCallbackStatusFormProps = {
  callbackRequestId: string;
  currentStatus: CallbackStatus;
};

export function AdminCallbackStatusForm({ callbackRequestId, currentStatus }: AdminCallbackStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const response = await fetch(`/api/admin/callback-requests/${callbackRequestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status,
        comment
      })
    });

    const result = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось сохранить изменения.");
      return;
    }

    setComment("");
    router.refresh();
  }

  return (
    <form className="admin-status-form" onSubmit={handleSubmit}>
      <label htmlFor="callback-status">Статус обращения</label>
      <select
        id="callback-status"
        value={status}
        disabled={isSaving}
        onChange={(event) => setStatus(event.target.value as CallbackStatus)}
      >
        {CALLBACK_STATUS_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label htmlFor="callback-comment">Комментарий администратора</label>
      <textarea
        id="callback-comment"
        maxLength={1000}
        value={comment}
        disabled={isSaving}
        placeholder="Например: клиент попросил перезвонить завтра"
        onChange={(event) => setComment(event.target.value)}
      />

      <button className="btn btn-primary" type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить"}
      </button>
      {error ? <div className="auth-error">{error}</div> : null}
    </form>
  );
}
