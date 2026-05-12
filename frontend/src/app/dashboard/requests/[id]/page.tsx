import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRequestFileButton } from "@/components/DeleteRequestFileButton";
import { StatusHistoryList } from "@/components/StatusHistoryList";
import { requireUser } from "@/lib/auth";
import { getUserRequestFileDownloadUrl } from "@/lib/backend-file-url";
import { getMyRequestFromBackend } from "@/lib/backend-requests-server";
import { formatRequestTitle } from "@/lib/request-number";
import { getRequestStatusLabel } from "@/lib/request-status";

type RequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  await requireUser();
  const { id } = await params;
  const { request } = await getMyRequestFromBackend(id).catch((error: Error & { status?: number }) => {
    if (error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="dashboard-wide-card">
          <Link className="btn btn-primary dashboard-back-button" href="/dashboard/requests">
            Мои заявки
          </Link>

          <div className="request-detail-header">
            <div>
              <div className="section-label">Заявка</div>
              <h1>{formatRequestTitle(request.requestNumber)}</h1>
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

          <StatusHistoryList title="История обработки" items={request.statusHistory} />

          <div className="request-files-panel">
            <h2>Прикреплённые файлы</h2>
            {request.files.length === 0 ? (
              <p>Файлы пока не прикреплены.</p>
            ) : (
              <div className="request-files-list">
                {request.files.map((file) => (
                  <div className="request-file-item" key={file.id}>
                    <div>
                      <strong>{file.originalName || file.fileName}</strong>
                      <span>{[file.fileType, file.sizeBytes ? `${Math.ceil(file.sizeBytes / 1024)} KB` : ""].filter(Boolean).join(" · ") || "Файл"}</span>
                    </div>
                    <div className="request-file-actions">
                      <a href={getUserRequestFileDownloadUrl(request.id, file.id)} target="_blank" rel="noreferrer">
                        Открыть
                      </a>
                      <DeleteRequestFileButton
                        entityId={request.id}
                        entityType="request"
                        fileId={file.id}
                        fileName={file.originalName || file.fileName}
                        mode="user"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-actions request-detail-actions">
            <Link className="btn btn-primary" href={`/dashboard/requests/${request.id}/edit`}>
              Редактировать заявку
            </Link>
          </div>
    </div>
  );
}
