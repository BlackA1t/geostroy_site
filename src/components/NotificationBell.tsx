"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NotificationOpenRequestButton } from "./NotificationActions";

export type HeaderNotification = {
  id: string;
  title: string;
  message: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  requestId: string | null;
};

type NotificationBellProps = {
  notifications: HeaderNotification[];
  unreadCount: number;
};

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

function BellIcon() {
  return (
    <svg className="notification-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M18 10.7V9a6 6 0 0 0-12 0v1.7c0 1.5-.5 3-1.4 4.2L4 15.7V17h16v-1.3l-.6-.8A7 7 0 0 1 18 10.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9.5 20a2.8 2.8 0 0 0 5 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const notificationLabel = unreadCount > 0 ? `Уведомления, непрочитанных: ${unreadCount}` : "Уведомления";

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button
        className="notification-bell-button"
        type="button"
        aria-expanded={isOpen}
        aria-label={notificationLabel}
        title={notificationLabel}
        onClick={() => setIsOpen((current) => !current)}
      >
        <BellIcon />
        {unreadCount > 0 ? <span className="notification-badge">{formatUnreadCount(unreadCount)}</span> : null}
      </button>

      {isOpen ? (
        <div className="notification-dropdown" role="dialog" aria-label="Уведомления">
          <div className="notification-dropdown-header">
            <h2>Уведомления</h2>
            {unreadCount > 0 ? <span>{formatUnreadCount(unreadCount)} новых</span> : null}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-dropdown-empty">Уведомлений пока нет</div>
          ) : (
            <div className="notification-dropdown-list">
              {notifications.map((notification) => (
                <article className="notification-dropdown-item" key={notification.id}>
                  <div>
                    <h3>{notification.title}</h3>
                    {!notification.readAt ? <span className="notification-dropdown-badge">Новое</span> : null}
                  </div>
                  <p>{notification.message}</p>
                  <time dateTime={new Date(notification.createdAt).toISOString()}>
                    {formatDateTime(notification.createdAt)}
                  </time>
                  {notification.requestId ? (
                    <NotificationOpenRequestButton
                      className="notification-open-request-button"
                      isRead={Boolean(notification.readAt)}
                      notificationId={notification.id}
                      requestId={notification.requestId}
                      onNavigate={() => setIsOpen(false)}
                    />
                  ) : null}
                </article>
              ))}
            </div>
          )}

          <div className="notification-dropdown-footer">
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
              Все уведомления
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
