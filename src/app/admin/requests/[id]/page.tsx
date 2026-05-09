import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminStatusSelect } from "@/components/AdminStatusSelect";
import { StatusHistoryList } from "@/components/StatusHistoryList";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestStatusLabel } from "@/lib/request-status";

type AdminRequestDetailsPageProps = {
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

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes) return "";
  if (sizeBytes < 1024 * 1024) return `${Math.ceil(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function AdminRequestDetailsPage({ params }: AdminRequestDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: {
          createdAt: "desc"
        }
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      statusHistory: {
        orderBy: {
          createdAt: "asc"
        },
        include: {
          changedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!request) {
    notFound();
  }

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
              <h1>{request.id}</h1>
            </div>
            <span className={`status-badge status-${request.status.toLowerCase()}`}>
              {getRequestStatusLabel(request.status)}
            </span>
          </div>

          <AdminStatusSelect currentStatus={request.status} endpoint={`/api/admin/requests/${request.id}`} />

          <StatusHistoryList title="История статусов" items={request.statusHistory} showActorDetails />

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
                    <a href={file.fileUrl} target="_blank" rel="noreferrer">
                      Открыть
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}
