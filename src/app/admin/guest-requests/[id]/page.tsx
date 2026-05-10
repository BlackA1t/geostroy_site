import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminRequestEditForm } from "@/components/AdminRequestEditForm";
import { AdminStatusSelect } from "@/components/AdminStatusSelect";
import { StatusHistoryList } from "@/components/StatusHistoryList";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGuestRequestTitle, formatRequestTitle } from "@/lib/request-number";
import { getRequestStatusLabel } from "@/lib/request-status";

type AdminGuestRequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(date: Date | null) {
  if (!date) return "Нет";
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

export default async function AdminGuestRequestDetailsPage({ params }: AdminGuestRequestDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;

  const request = await prisma.guestRequest.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: {
          createdAt: "desc"
        }
      },
      claimedBy: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      convertedRequest: {
        select: {
          requestNumber: true
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

  if (request.claimedAt) {
    if (request.convertedRequestId) {
      redirect(`/admin/requests/${request.convertedRequestId}`);
    }

    redirect("/admin/guest-requests");
  }

  return (
    <div className="admin-container">
          <div className="admin-detail-nav">
            <Link className="btn btn-primary" href="/admin/guest-requests">
              Все гостевые заявки
            </Link>
            {request.convertedRequestId ? (
              <Link className="btn btn-outline" href={`/admin/requests/${request.convertedRequestId}`}>
                Открыть {formatRequestTitle(request.convertedRequest?.requestNumber)}
              </Link>
            ) : null}
          </div>

          <div className="request-detail-header">
            <div>
              <div className="section-label">Гостевая заявка</div>
              <h1>{formatGuestRequestTitle(request.guestRequestNumber)}</h1>
            </div>
            <span className={`status-badge status-${request.status.toLowerCase()}`}>
              {getRequestStatusLabel(request.status)}
            </span>
          </div>

          <AdminStatusSelect currentStatus={request.status} endpoint={`/api/admin/guest-requests/${request.id}`} />

          <StatusHistoryList title="История обработки" items={request.statusHistory} showActorDetails />

          <AdminRequestEditForm
            type="guestRequest"
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
              <span>Имя</span>
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
              <span>Дата привязки</span>
              <strong>{formatDateTime(request.claimedAt)}</strong>
            </div>
            <div>
              <span>Привязанный пользователь</span>
              <strong>{request.claimedBy ? `${request.claimedBy.name} / ${request.claimedBy.email}` : "Нет"}</strong>
            </div>
            <div>
              <span>Обычная заявка</span>
              <strong>
                {request.convertedRequestId ? formatRequestTitle(request.convertedRequest?.requestNumber) : "Нет"}
              </strong>
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
