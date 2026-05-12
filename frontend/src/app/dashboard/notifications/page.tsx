import {
  MarkAllNotificationsReadButton,
  NotificationOpenRequestButton
} from "@/components/NotificationActions";
import { NotificationMessage } from "@/components/NotificationMessage";
import { requireUser } from "@/lib/auth";
import { getNotificationsFromBackend } from "@/lib/backend-notifications-server";

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export default async function DashboardNotificationsPage() {
  await requireUser();

  const notifications = await getNotificationsFromBackend();

  const hasUnread = notifications.some((notification) => !notification.readAt);

  return (
    <div className="dashboard-wide-card">
      <div className="dashboard-heading">
        <div>
          <div className="section-label">Личный кабинет</div>
          <h1>Уведомления</h1>
          <p>Здесь собраны внутренние уведомления по вашим заявкам.</p>
        </div>
      </div>

      {hasUnread ? <MarkAllNotificationsReadButton /> : null}

      <div className="notifications-list">
        {notifications.map((notification) => (
          <article
            className={`notification-card${notification.readAt ? "" : " unread"}`}
            key={notification.id}
          >
            <div className="notification-card-top">
              <div>
                <h2>
                  {notification.displayTitle}
                </h2>
                <span>{formatDateTime(notification.createdAt)}</span>
              </div>
              {notification.readAt ? (
                <span className="notification-read-label">Прочитано</span>
              ) : (
                <span className="notification-badge">Новое</span>
              )}
            </div>
            <NotificationMessage message={notification.message} />
            <div className="notification-card-actions">
              {notification.requestId ? (
                <NotificationOpenRequestButton
                  isRead={Boolean(notification.readAt)}
                  notificationId={notification.id}
                  requestId={notification.requestId}
                />
              ) : null}
            </div>
          </article>
        ))}
        {notifications.length === 0 ? (
          <div className="requests-empty">
            <h2>Уведомлений пока нет</h2>
            <p>Когда статус заявки изменится, уведомление появится здесь.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
