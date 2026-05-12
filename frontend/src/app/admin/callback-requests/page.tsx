import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminCallbackRequestsFromBackend } from "@/lib/backend-callback-requests-server";
import {
  CALLBACK_STATUS_OPTIONS,
  getCallbackStatusClassName,
  getCallbackStatusLabel,
  isCallbackStatus,
  type CallbackStatus
} from "@/lib/callback-status";
import { formatCallbackRequestTitle } from "@/lib/request-number";

type AdminCallbackRequestsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

function getStatusHref(status: CallbackStatus | undefined, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/callback-requests?${query}` : "/admin/callback-requests";
}

export default async function AdminCallbackRequestsPage({ searchParams }: AdminCallbackRequestsPageProps) {
  await requireAdmin();
  const { q: rawQ, status } = await searchParams;
  const statusFilter = isCallbackStatus(status) ? status : null;
  const q = String(rawQ ?? "").trim();
  const { callbackRequests } = await getAdminCallbackRequestsFromBackend({ q, status: statusFilter });

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Обратные звонки</h1>
          <p>Заявки на звонок с главной страницы сайта.</p>
        </div>
      </div>

      <div className="request-toolbar">
        <form className="request-search" action="/admin/callback-requests">
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <label htmlFor="admin-callback-search">Поиск</label>
          <div>
            <input
              id="admin-callback-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="№ звонка, телефон, имя или внутренний ID"
            />
            <button className="btn btn-primary" type="submit">
              Найти
            </button>
          </div>
        </form>
      </div>

      <div className="admin-filters">
        <Link className={`admin-filter-link${!statusFilter ? " active" : ""}`} href={getStatusHref(undefined, q)}>
          Все
        </Link>
        {CALLBACK_STATUS_OPTIONS.map((item) => (
          <Link
            className={`admin-filter-link${statusFilter === item.value ? " active" : ""}`}
            href={getStatusHref(item.value, q)}
            key={item.value}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="admin-list">
        {callbackRequests.map((item) => (
          <article className="admin-list-card callback-admin-card" key={item.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">{formatCallbackRequestTitle(item.callbackRequestNumber)}</span>
                <span className={`status-badge ${getCallbackStatusClassName(item.status)}`}>
                  {getCallbackStatusLabel(item.status)}
                </span>
              </div>
              <h2>{item.phone}</h2>
              <div className="admin-list-meta">
                <span>Имя: {item.name || "не указано"}</span>
                <span>Создана {formatDateTime(item.createdAt)}</span>
                <span>Обновлена {formatDateTime(item.updatedAt)}</span>
                {item.statusHistory[0]?.comment ? (
                  <span>Последний комментарий: {item.statusHistory[0].comment}</span>
                ) : null}
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/callback-requests/${item.id}`}>
              Открыть
            </Link>
          </article>
        ))}
        {callbackRequests.length === 0 ? (
          <div className="requests-empty">
            <h2>Обратные звонки не найдены</h2>
            <p>
              {q || statusFilter
                ? "Попробуйте изменить параметры поиска или фильтра."
                : "Заявок на обратный звонок пока нет."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
