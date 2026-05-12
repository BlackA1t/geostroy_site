import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminRequestEditForm } from "@/components/AdminRequestEditForm";
import { AdminStatusSelect } from "@/components/AdminStatusSelect";
import { DeleteRequestFileButton } from "@/components/DeleteRequestFileButton";
import { StatusHistoryList } from "@/components/StatusHistoryList";
import { requireAdmin } from "@/lib/auth";
import { getAdminRequestFileDownloadUrl } from "@/lib/backend-file-url";
import { getAdminRequestFromBackend } from "@/lib/backend-admin-requests-server";
import { formatRequestTitle } from "@/lib/request-number";
import { getRequestStatusLabel } from "@/lib/request-status";

type AdminRequestDetailsPageProps = {
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

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes) return "";
  if (sizeBytes < 1024 * 1024) return `${Math.ceil(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function AdminRequestDetailsPage({ params }: AdminRequestDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;

  const { request } = await getAdminRequestFromBackend(id).catch((error: Error & { status?: number }) => {
    if (error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="admin-container">
          <div className="admin-detail-nav">
            <Link className="btn btn-primary" href="/admin/requests">
              Все пользовательские заявки
            </Link>
          </div>

          <div className="request-detail-header">
            <div>
              <div className="section-label">Пользовательская заявка</div>
              <h1>{formatRequestTitle(request.requestNumber)}</h1>
            </div>
            <span className={`status-badge status-${request.status.toLowerCase()}`}>
              {getRequestStatusLabel(request.status)}
            </span>
          </div>

          <AdminStatusSelect currentStatus={request.status} endpoint={`/api/admin/requests/${request.id}`} />

          <StatusHistoryList title="История обработки" items={request.statusHistory} showActorDetails />

          <AdminRequestEditForm
            type="request"
            id={request.id}
            initialValues={{
              serviceType: request.serviceType,
              material: request.material,
              quantity: request.quantity,
              description: request.description,
              name: request.name,
              phone: request.phone,
              email: request.email
            }}
          />

          <div className="request-detail-grid admin-detail-grid">
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
            <div>
              <span>Внутренний ID</span>
              <strong>{request.id}</strong>
            </div>
            <div>
              <span>Пользователь</span>
              <strong>{request.user ? `${request.user.name} / ${request.user.email}` : "Не привязан"}</strong>
            </div>
          </div>

          <div className="request-description">
            <span>Описание</span>
            <p>{request.description}</p>
          </div>

          <div className="request-files-panel">
            <h2>Файлы</h2>
            {request.files.length === 0 ? (
              <p>Файлы не прикреплены.</p>
            ) : (
              <div className="request-files-list">
                {request.files.map((file) => (
                  <div className="request-file-item" key={file.id}>
                    <div>
                      <strong>{file.originalName || file.fileName}</strong>
                      <span>
                        {[file.fileType, formatFileSize(file.sizeBytes)].filter(Boolean).join(" · ") || "Файл"}
                      </span>
                    </div>
                    <div className="request-file-actions">
                      <a href={getAdminRequestFileDownloadUrl(request.id, file.id)} target="_blank" rel="noreferrer">
                        Открыть
                      </a>
                      <DeleteRequestFileButton
                        entityId={request.id}
                        entityType="request"
                        fileId={file.id}
                        fileName={file.originalName || file.fileName}
                        mode="admin"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}
