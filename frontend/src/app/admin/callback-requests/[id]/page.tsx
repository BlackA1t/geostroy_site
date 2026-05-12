import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCallbackStatusForm } from "@/components/AdminCallbackStatusForm";
import { CallbackStatusHistoryList } from "@/components/CallbackStatusHistoryList";
import { requireAdmin } from "@/lib/auth";
import { getAdminCallbackRequestFromBackend } from "@/lib/backend-callback-requests-server";
import { getCallbackStatusClassName, getCallbackStatusLabel } from "@/lib/callback-status";
import { formatCallbackRequestTitle } from "@/lib/request-number";

type AdminCallbackRequestDetailsPageProps = {
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

export default async function AdminCallbackRequestDetailsPage({ params }: AdminCallbackRequestDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;
  const { callbackRequest } = await getAdminCallbackRequestFromBackend(id).catch((error: Error & { status?: number }) => {
    if (error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="admin-container">
      <div className="admin-detail-nav">
        <Link className="btn btn-primary" href="/admin/callback-requests">
          Назад к обратным звонкам
        </Link>
      </div>

      <div className="request-detail-header">
        <div>
          <div className="section-label">Обратный звонок</div>
          <h1>{formatCallbackRequestTitle(callbackRequest.callbackRequestNumber)}</h1>
        </div>
        <span className={`status-badge ${getCallbackStatusClassName(callbackRequest.status)}`}>
          {getCallbackStatusLabel(callbackRequest.status)}
        </span>
      </div>

      <div className="request-detail-grid admin-detail-grid">
        <div>
          <span>Телефон</span>
          <strong>{callbackRequest.phone}</strong>
        </div>
        <div>
          <span>Имя</span>
          <strong>{callbackRequest.name || "Не указано"}</strong>
        </div>
        <div>
          <span>Дата создания</span>
          <strong>{formatDateTime(callbackRequest.createdAt)}</strong>
        </div>
        <div>
          <span>Дата обновления</span>
          <strong>{formatDateTime(callbackRequest.updatedAt)}</strong>
        </div>
      </div>

      <AdminCallbackStatusForm
        callbackRequestId={callbackRequest.id}
        currentStatus={callbackRequest.status}
      />

      <CallbackStatusHistoryList items={callbackRequest.statusHistory} />
    </div>
  );
}
