import {
  MarkAllNotificationsReadButton,
  NotificationOpenRequestButton
} from "@/components/NotificationActions";
import { NotificationMessage } from "@/components/NotificationMessage";
import { requireUser } from "@/lib/auth";
import { formatRequestTitle } from "@/lib/request-number";
import { sortNotificationsUnreadFirst } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function DashboardNotificationsPage() {
  const user = await requireUser();

  const notifications = sortNotificationsUnreadFirst(await prisma.notification.findMany({
    where: {
      userId: user.id
    },
    include: {
      request: {
        select: {
          requestNumber: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }));

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
                  {notification.request ? formatRequestTitle(notification.request.requestNumber) : notification.title}
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
