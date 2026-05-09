import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRequestTitle } from "@/lib/request-number";
import { getRequestStatusLabel, isRequestStatus, REQUEST_STATUSES } from "@/lib/request-status";

type AdminGuestRequestsPageProps = {
  searchParams: Promise<{
    claimed?: string;
    status?: string;
  }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

function getClaimedHref(claimed: string, statusFilter: RequestStatus | null) {
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  params.set("claimed", claimed);
  return `/admin/guest-requests?${params.toString()}`;
}

export default async function AdminGuestRequestsPage({ searchParams }: AdminGuestRequestsPageProps) {
  await requireAdmin();
  const { claimed = "unclaimed", status } = await searchParams;
  const statusFilter = isRequestStatus(status) ? status : null;
  const claimedFilter = ["all", "claimed", "unclaimed"].includes(claimed) ? claimed : "unclaimed";

  const guestRequests = await prisma.guestRequest.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(claimedFilter === "claimed"
        ? {
            claimedAt: { not: null },
            claimedById: { not: null },
            convertedRequestId: { not: null }
          }
        : {}),
      ...(claimedFilter === "unclaimed"
        ? {
            OR: [{ claimedAt: null }, { claimedById: null }, { convertedRequestId: null }]
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      claimedBy: {
        select: {
          name: true,
          email: true
        }
      },
      convertedRequest: {
        select: {
          requestNumber: true
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
          <h1>Гостевые заявки</h1>
          <p>Заявки, отправленные без авторизации через страницу контактов.</p>
        </div>
      </div>

      <div className="admin-filters">
        <Link className={`admin-filter-link${claimedFilter === "all" ? " active" : ""}`} href={getClaimedHref("all", statusFilter)}>
          Все
        </Link>
        <Link className={`admin-filter-link${claimedFilter === "claimed" ? " active" : ""}`} href={getClaimedHref("claimed", statusFilter)}>
          Привязанные
        </Link>
        <Link className={`admin-filter-link${claimedFilter === "unclaimed" ? " active" : ""}`} href={getClaimedHref("unclaimed", statusFilter)}>
          Непривязанные
        </Link>
      </div>

      <div className="admin-filters">
        <Link
          className={`admin-filter-link${!statusFilter ? " active" : ""}`}
          href={`/admin/guest-requests?claimed=${claimedFilter}`}
        >
          Все статусы
        </Link>
        {REQUEST_STATUSES.map((item: RequestStatus) => (
          <Link
            className={`admin-filter-link${statusFilter === item ? " active" : ""}`}
            href={`/admin/guest-requests?claimed=${claimedFilter}&status=${item}`}
            key={item}
          >
            {getRequestStatusLabel(item)}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {guestRequests.map((request) => (
          <article className="admin-list-card" key={request.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">Гостевая заявка {request.id}</span>
                <span className={`status-badge status-${request.status.toLowerCase()}`}>
                  {getRequestStatusLabel(request.status)}
                </span>
                {request.claimedAt ? <span className="status-badge status-completed">Привязана</span> : null}
              </div>
              <h2>{request.serviceType}</h2>
              <div className="admin-list-meta">
                <span>{request.name}</span>
                <span>{request.phone}</span>
                <span>{request.email || "Email не указан"}</span>
                <span>Создана {formatDate(request.createdAt)}</span>
                <span>{request.claimedAt ? `Привязана ${formatDate(request.claimedAt)}` : "Не привязана"}</span>
                <span>
                  Пользователь: {request.claimedBy ? `${request.claimedBy.name} / ${request.claimedBy.email}` : "нет"}
                </span>
                <span>
                  Обычная заявка:{" "}
                  {request.convertedRequestId ? (
                    <Link href={`/admin/requests/${request.convertedRequestId}`}>
                      {formatRequestTitle(request.convertedRequest?.requestNumber)}
                    </Link>
                  ) : (
                    "нет"
                  )}
                </span>
                <span>Файлов: {request._count.files}</span>
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/guest-requests/${request.id}`}>
              Подробнее
            </Link>
          </article>
        ))}
        {guestRequests.length === 0 ? <div className="requests-empty">Гостевых заявок с такими условиями нет.</div> : null}
      </div>
    </div>
  );
}
