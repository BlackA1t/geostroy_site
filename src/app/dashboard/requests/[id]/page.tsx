import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestStatusLabel } from "@/lib/request-status";

type RequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const request = await prisma.request.findFirst({
    where: {
      id,
      userId: user.id
    }
  });

  if (!request) {
    notFound();
  }

  return (
    <main>
      <section className="section dashboard-page dashboard-section">
        <div className="dashboard-wide-card">
          <Link className="btn btn-primary dashboard-back-button" href="/dashboard/requests">
            Назад к заявкам
          </Link>

          <div className="request-detail-header">
            <div>
              <div className="section-label">Заявка</div>
              <h1>{request.id}</h1>
            </div>
            <span className={`status-badge status-${request.status.toLowerCase()}`}>
              {getRequestStatusLabel(request.status)}
            </span>
          </div>

          <div className="request-detail-grid">
            <div>
              <span>Тип услуги</span>
              <strong>{request.serviceType}</strong>
            </div>
            <div>
              <span>Материал</span>
              <strong>{request.material || "Не указан"}</strong>
            </div>
            <div>
              <span>Количество</span>
              <strong>{request.quantity || "Не указано"}</strong>
            </div>
            <div>
              <span>Контактное лицо</span>
              <strong>{request.name}</strong>
            </div>
            <div>
              <span>Телефон</span>
              <strong>{request.phone}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{request.email || "Не указан"}</strong>
            </div>
            <div>
              <span>Дата создания</span>
              <strong>{formatDateTime(request.createdAt)}</strong>
            </div>
            <div>
              <span>Дата обновления</span>
              <strong>{formatDateTime(request.updatedAt)}</strong>
            </div>
          </div>

          <div className="request-description">
            <span>Описание</span>
            <p>{request.description}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
