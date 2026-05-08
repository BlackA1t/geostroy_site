"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationReadButtonProps = {
  notificationId: string;
};

export function NotificationReadButton({ notificationId }: NotificationReadButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setIsLoading(true);
    setError("");

    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH"
    });

    setIsLoading(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "Не удалось отметить уведомление.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="notification-action">
      <button className="btn btn-outline" type="button" disabled={isLoading} onClick={handleClick}>
        {isLoading ? "Сохранение..." : "Отметить прочитанным"}
      </button>
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}

export function MarkAllNotificationsReadButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/notifications/read-all", {
      method: "PATCH"
    });

    setIsLoading(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "Не удалось отметить уведомления.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="notification-action">
      <button className="btn btn-primary" type="button" disabled={isLoading} onClick={handleClick}>
        {isLoading ? "Сохранение..." : "Отметить все как прочитанные"}
      </button>
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}
