import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestStatusLabel } from "@/lib/request-status";

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

export default async function RequestsPage() {
  const user = await requireUser();

  const requests = await prisma.request.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
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

      {requests.length === 0 ? (
        <div className="requests-empty">
          <h2>Заявок пока нет</h2>
          <p>Создайте первую заявку, и она появится в этом списке.</p>
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
                  <span className="request-id">Заявка {request.id}</span>
                  <span className={`status-badge status-${request.status.toLowerCase()}`}>
                    {getRequestStatusLabel(request.status)}
                  </span>
                </div>
                <h2>{request.serviceType}</h2>
                <p>{request.description}</p>
                <span className="request-date">Создана {formatDate(request.createdAt)}</span>
              </div>
              <Link className="btn btn-outline request-details-link" href={`/dashboard/requests/${request.id}`}>
                Подробнее
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
