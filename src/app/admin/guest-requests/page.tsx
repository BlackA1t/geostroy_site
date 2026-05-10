import Link from "next/link";
import type { Prisma, RequestStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGuestRequestTitle, parseRequestNumberSearch } from "@/lib/request-number";
import { getRequestStatusClassName, getRequestStatusLabel, isRequestStatus } from "@/lib/request-status";

type AdminGuestRequestsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

const STATUS_FILTERS: Array<{ status?: RequestStatus; label: string }> = [
  { label: "Все" },
  { status: "NEW", label: "Новые" },
  { status: "NEED_INFO", label: "Требуется уточнение" },
  { status: "IN_PROGRESS", label: "В работе" },
  { status: "COMPLETED", label: "Выполненные" },
  { status: "CANCELLED", label: "Отменённые" }
];

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

function getGuestRequestsHref({ q, status }: { q: string; status?: RequestStatus }) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/guest-requests?${query}` : "/admin/guest-requests";
}

export default async function AdminGuestRequestsPage({ searchParams }: AdminGuestRequestsPageProps) {
  await requireAdmin();
  const { q: rawQ, status } = await searchParams;
  const statusFilter = isRequestStatus(status) ? status : null;
  const q = String(rawQ ?? "").trim();
  const guestRequestNumberSearch = parseRequestNumberSearch(q);

  const where: Prisma.GuestRequestWhereInput = {
    claimedAt: null,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { serviceType: { contains: q, mode: "insensitive" } },
            { material: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            ...(guestRequestNumberSearch ? [{ guestRequestNumber: guestRequestNumberSearch }] : [])
          ]
        }
      : {})
  };

  const guestRequests = await prisma.guestRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
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

      <div className="request-toolbar">
        <form className="request-search" action="/admin/guest-requests">
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <label htmlFor="admin-guest-request-search">Поиск</label>
          <div>
            <input
              id="admin-guest-request-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="№ заявки, клиент, телефон, email, услуга"
            />
            <button className="btn btn-primary" type="submit">
              Найти
            </button>
          </div>
        </form>
      </div>

      <div className="admin-filters">
        {STATUS_FILTERS.map((item) => (
          <Link
            className={`admin-filter-link${statusFilter === (item.status ?? null) ? " active" : ""}`}
            href={getGuestRequestsHref({ q, status: item.status })}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {guestRequests.map((request) => (
          <article className="admin-list-card" key={request.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">{formatGuestRequestTitle(request.guestRequestNumber)}</span>
                <span className={`status-badge ${getRequestStatusClassName(request.status)}`}>
                  {getRequestStatusLabel(request.status)}
                </span>
              </div>
              <h2>{request.serviceType}</h2>
              <div className="admin-list-meta">
                <span>Клиент: {request.name}</span>
                <span>Телефон: {request.phone}</span>
                <span>Email: {request.email || "не указан"}</span>
                {request.material ? <span>Материал: {request.material}</span> : null}
                <span>Создана {formatDate(request.createdAt)}</span>
                <span>Файлов: {request._count.files}</span>
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/guest-requests/${request.id}`}>
              Открыть
            </Link>
          </article>
        ))}
        {guestRequests.length === 0 ? (
          <div className="requests-empty">
            <h2>Заявки не найдены</h2>
            <p>
              {q || statusFilter
                ? "Попробуйте изменить параметры поиска или фильтра."
                : "Активных гостевых заявок пока нет."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
