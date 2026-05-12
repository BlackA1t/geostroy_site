"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { backendNotificationsClient } from "@/lib/backend-notifications-client";

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
      await backendNotificationsClient.markNotificationRead(notificationId).catch(() => null);
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

    try {
      await backendNotificationsClient.markAllNotificationsRead();
    } catch (error) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Не удалось отметить уведомления.");
      return;
    }

    setIsLoading(false);
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
