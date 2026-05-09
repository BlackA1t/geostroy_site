import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestStatusLabel, isRequestStatus, REQUEST_STATUSES } from "@/lib/request-status";

type AdminRequestsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  await requireAdmin();
  const { status } = await searchParams;
  const statusFilter = isRequestStatus(status) ? status : null;

  const requests = await prisma.request.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          files: true
        }
      }
    }
  });

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Пользовательские заявки</h1>
          <p>Все заявки, созданные или привязанные к пользователям.</p>
        </div>
      </div>

      <div className="admin-filters">
        <Link className={`admin-filter-link${!statusFilter ? " active" : ""}`} href="/admin/requests">
          Все
        </Link>
        {REQUEST_STATUSES.map((item: RequestStatus) => (
          <Link
            className={`admin-filter-link${statusFilter === item ? " active" : ""}`}
            href={`/admin/requests?status=${item}`}
            key={item}
          >
            {getRequestStatusLabel(item)}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {requests.map((request) => (
          <article className="admin-list-card" key={request.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">Заявка {request.id}</span>
                <span className={`status-badge status-${request.status.toLowerCase()}`}>
                  {getRequestStatusLabel(request.status)}
                </span>
              </div>
              <h2>{request.serviceType}</h2>
              <div className="admin-list-meta">
                <span>{request.name}</span>
                <span>{request.phone}</span>
                <span>{request.email || "Email не указан"}</span>
                <span>Создана {formatDate(request.createdAt)}</span>
                <span>
                  Пользователь: {request.user ? `${request.user.name} / ${request.user.email}` : "не привязан"}
                </span>
                <span>Файлов: {request._count.files}</span>
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/requests/${request.id}`}>
              Подробнее
            </Link>
          </article>
        ))}
        {requests.length === 0 ? <div className="requests-empty">Заявок с такими условиями нет.</div> : null}
      </div>
    </div>
  );
}
