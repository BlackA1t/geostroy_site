import Link from "next/link";
import type { CallbackStatus } from "@prisma/client";
import { AdminCallbackStatusSelect } from "@/components/AdminCallbackStatusSelect";
import { requireAdmin } from "@/lib/auth";
import { CALLBACK_STATUSES, getCallbackStatusLabel, isCallbackStatus } from "@/lib/callback-status";
import { prisma } from "@/lib/prisma";

type AdminCallbackRequestsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminCallbackRequestsPage({ searchParams }: AdminCallbackRequestsPageProps) {
  await requireAdmin();
  const { status } = await searchParams;
  const statusFilter = isCallbackStatus(status) ? status : null;

  const callbackRequests = await prisma.callbackRequest.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Обратные звонки</h1>
          <p>Заявки на звонок с главной страницы сайта.</p>
        </div>
      </div>

      <div className="admin-filters">
        <Link className={`admin-filter-link${!statusFilter ? " active" : ""}`} href="/admin/callback-requests">
          Все
        </Link>
        {CALLBACK_STATUSES.map((item: CallbackStatus) => (
          <Link
            className={`admin-filter-link${statusFilter === item ? " active" : ""}`}
            href={`/admin/callback-requests?status=${item}`}
            key={item}
          >
            {getCallbackStatusLabel(item)}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {callbackRequests.map((item) => (
          <article className="admin-list-card callback-admin-card" key={item.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">Обратный звонок {item.id}</span>
                <span className={`status-badge callback-status-${item.status.toLowerCase()}`}>
                  {getCallbackStatusLabel(item.status)}
                </span>
              </div>
              <h2>{item.phone}</h2>
              <div className="admin-list-meta">
                <span>Имя: {item.name || "не указано"}</span>
                <span>Создана {formatDateTime(item.createdAt)}</span>
              </div>
            </div>
            <AdminCallbackStatusSelect callbackRequestId={item.id} currentStatus={item.status} />
          </article>
        ))}
        {callbackRequests.length === 0 ? (
          <div className="requests-empty">Обратных звонков с такими условиями нет.</div>
        ) : null}
      </div>
    </div>
  );
}
