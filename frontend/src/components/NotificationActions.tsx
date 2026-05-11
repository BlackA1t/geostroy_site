"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationOpenRequestButtonProps = {
  className?: string;
  isRead: boolean;
  notificationId: string;
  onNavigate?: () => void;
  requestId: string;
};

export function NotificationOpenRequestButton({
  className,
  isRead,
  notificationId,
  onNavigate,
  requestId
}: NotificationOpenRequestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) return;

    setIsLoading(true);

    if (!isRead) {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH"
      }).catch(() => null);
    }

    onNavigate?.();
    router.push(`/dashboard/requests/${requestId}`);
    router.refresh();
  }

  return (
    <button className={className ?? "btn btn-primary"} type="button" disabled={isLoading} onClick={handleClick}>
      {isLoading ? "Открываем..." : "Открыть заявку"}
    </button>
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
