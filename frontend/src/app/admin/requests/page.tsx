import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminRequestsFromBackend } from "@/lib/backend-admin-requests-server";
import { formatRequestTitle } from "@/lib/request-number";
import {
  getRequestStatusClassName,
  getRequestStatusLabel,
  isRequestStatus,
  type RequestStatus
} from "@/lib/request-status";

type AdminRequestsPageProps = {
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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ru-RU");
}

function getStatusHref(status: RequestStatus | undefined, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/requests?${query}` : "/admin/requests";
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  await requireAdmin();
  const { status, q: rawQ } = await searchParams;
  const statusFilter = isRequestStatus(status) ? status : null;
  const q = String(rawQ ?? "").trim();
  const { requests } = await getAdminRequestsFromBackend({ q, status: statusFilter });

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Пользовательские заявки</h1>
          <p>Все заявки, созданные или привязанные к пользователям.</p>
        </div>
      </div>

      <div className="request-toolbar">
        <form className="request-search" action="/admin/requests">
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <label htmlFor="admin-request-search">Поиск</label>
          <div>
            <input
              id="admin-request-search"
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
            href={getStatusHref(item.status, q)}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {requests.map((request) => (
          <article className="admin-list-card" key={request.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">{formatRequestTitle(request.requestNumber)}</span>
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
                <span>
                  Пользователь: {request.user ? `${request.user.name} / ${request.user.email}` : "не привязан"}
                </span>
                <span>Файлов: {request._count.files}</span>
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/requests/${request.id}`}>
              Открыть
            </Link>
          </article>
        ))}
        {requests.length === 0 ? (
          <div className="requests-empty">
            <h2>Заявки не найдены</h2>
            <p>{q || statusFilter ? "Попробуйте изменить параметры поиска или фильтра." : "Пользовательских заявок пока нет."}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
