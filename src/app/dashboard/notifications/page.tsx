import Link from "next/link";
import {
  MarkAllNotificationsReadButton,
  NotificationReadButton
} from "@/components/NotificationActions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function DashboardNotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const hasUnread = notifications.some((notification) => !notification.readAt);

  return (
    <main>
      <section className="section dashboard-page dashboard-section">
        <div className="dashboard-wide-card">
          <div className="dashboard-heading">
            <div>
              <div className="section-label">Личный кабинет</div>
              <h1>Уведомления</h1>
              <p>Здесь собраны внутренние уведомления по вашим заявкам.</p>
            </div>
            <Link className="btn btn-outline" href="/dashboard">
              Личный кабинет
            </Link>
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
                    <h2>{notification.title}</h2>
                    <span>{formatDateTime(notification.createdAt)}</span>
                  </div>
                  {notification.readAt ? (
                    <span className="notification-read-label">Прочитано</span>
                  ) : (
                    <span className="notification-badge">Новое</span>
                  )}
                </div>
                <p>{notification.message}</p>
                <div className="notification-card-actions">
                  {notification.requestId ? (
                    <Link className="btn btn-primary" href={`/dashboard/requests/${notification.requestId}`}>
                      Открыть заявку
                    </Link>
                  ) : null}
                  {!notification.readAt ? <NotificationReadButton notificationId={notification.id} /> : null}
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
      </section>
    </main>
  );
}
