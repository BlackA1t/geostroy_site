import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserRoleForm } from "@/components/AdminUserRoleForm";
import { requireAdmin } from "@/lib/auth";
import { getAdminUserFromBackend } from "@/lib/backend-admin-users-server";
import { formatRequestTitle } from "@/lib/request-number";
import { getRequestStatusClassName, getRequestStatusLabel } from "@/lib/request-status";
import { getUserRoleClassName, getUserRoleLabel } from "@/lib/user-role";

type AdminUserDetailsPageProps = {
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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ru-RU");
}

export default async function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;
  const { user, requests } = await getAdminUserFromBackend(id).catch((error: Error & { status?: number }) => {
    if (error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="admin-container">
      <div className="admin-detail-nav">
        <Link className="btn btn-primary" href="/admin/users">
          Все пользователи
        </Link>
      </div>

      <div className="request-detail-header">
        <div>
          <div className="section-label">Пользователь</div>
          <h1>{user.name || user.email}</h1>
        </div>
        <span className={`status-badge ${getUserRoleClassName(user.role)}`}>
          {getUserRoleLabel(user.role)}
        </span>
      </div>

      <div className="request-detail-grid admin-detail-grid">
        <div>
          <span>Имя</span>
          <strong>{user.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div>
          <span>Телефон</span>
          <strong>{user.phone || "Не указан"}</strong>
        </div>
        <div>
          <span>Роль</span>
          <strong>{getUserRoleLabel(user.role)}</strong>
        </div>
        <div>
          <span>Дата регистрации</span>
          <strong>{formatDateTime(user.createdAt)}</strong>
        </div>
        <div>
          <span>Дата обновления</span>
          <strong>{formatDateTime(user.updatedAt)}</strong>
        </div>
      </div>

      <AdminUserRoleForm userId={user.id} currentRole={user.role} />

      <section className="user-requests-panel">
        <h2>Заявки пользователя</h2>
        {requests.length === 0 ? (
          <div className="requests-empty">
            <h2>У пользователя пока нет заявок</h2>
          </div>
        ) : (
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
                    <span>Материал: {request.material || "не указан"}</span>
                    <span>Создана {formatDate(request.createdAt)}</span>
                  </div>
                </div>
                <Link className="btn btn-outline request-details-link" href={`/admin/requests/${request.id}`}>
                  Открыть
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
