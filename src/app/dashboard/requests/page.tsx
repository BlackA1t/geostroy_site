import Link from "next/link";
import type { Prisma, RequestStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRequestTitle, parseRequestNumberSearch } from "@/lib/request-number";
import { getRequestStatusLabel, isRequestStatus, REQUEST_STATUSES } from "@/lib/request-status";

type RequestsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

const STATUS_FILTERS: Array<{ hrefStatus?: RequestStatus; label: string }> = [
  { label: "Все" },
  { hrefStatus: "NEW", label: "Новые" },
  { hrefStatus: "NEED_INFO", label: "Требуется уточнение" },
  { hrefStatus: "IN_PROGRESS", label: "В работе" },
  { hrefStatus: "COMPLETED", label: "Выполненные" },
  { hrefStatus: "CANCELLED", label: "Отменённые" }
];

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

function getStatusHref(status: RequestStatus | undefined, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/dashboard/requests?${query}` : "/dashboard/requests";
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const statusFilter = isRequestStatus(resolvedSearchParams?.status) ? resolvedSearchParams.status : null;
  const q = String(resolvedSearchParams?.q ?? "").trim();
  const requestNumberSearch = parseRequestNumberSearch(q);

  const baseWhere: Prisma.RequestWhereInput = {
    userId: user.id
  };

  const where: Prisma.RequestWhereInput = {
    ...baseWhere,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { serviceType: { contains: q, mode: "insensitive" } },
            { material: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            ...(requestNumberSearch ? [{ requestNumber: requestNumberSearch }] : [])
          ]
        }
      : {})
  };

  const requests = await prisma.request.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          files: true
        }
      }
    }
  });

  return (
    <div className="dashboard-wide-card">
      <div className="dashboard-heading">
        <div>
          <div className="section-label">Заявки</div>
          <h1>Мои заявки</h1>
          <p>История ваших обращений и текущие статусы обработки.</p>
        </div>
        <div className="dashboard-heading-actions">
          <Link className="btn btn-primary" href="/dashboard/requests/new">
            Создать заявку
          </Link>
        </div>
      </div>

      <div className="request-toolbar">
        <form className="request-search" action="/dashboard/requests">
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <label htmlFor="request-search">Поиск</label>
          <div>
            <input id="request-search" name="q" type="search" defaultValue={q} placeholder="Тип, материал, описание или №" />
            <button className="btn btn-primary" type="submit">
              Найти
            </button>
          </div>
        </form>
      </div>

      <div className="request-filters">
        {STATUS_FILTERS.map((item) => (
          <Link
            className={`request-filter-link${statusFilter === (item.hrefStatus ?? null) ? " active" : ""}`}
            href={getStatusHref(item.hrefStatus, q)}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="requests-empty">
          <h2>Заявок не найдено</h2>
          <p>Попробуйте изменить фильтр или создать новую заявку.</p>
          <Link className="btn btn-primary" href="/dashboard/requests/new">
            Создать заявку
          </Link>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-card-main">
                <div className="request-card-top">
                  <span className="request-card-number">{formatRequestTitle(request.requestNumber)}</span>
                  <span className={`status-badge status-${request.status.toLowerCase()}`}>
                    {getRequestStatusLabel(request.status)}
                  </span>
                </div>
                <h2>{request.serviceType}</h2>
                <div className="request-card-meta">
                  <span>Создана {formatDate(request.createdAt)}</span>
                  <span>Обновлена {formatDate(request.updatedAt)}</span>
                  <span>Файлов: {request._count.files}</span>
                </div>
                <p className="request-card-description">{request.description}</p>
              </div>
              <Link className="btn btn-outline request-details-link" href={`/dashboard/requests/${request.id}`}>
                Открыть
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
