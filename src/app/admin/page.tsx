import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();

  const [requestCount, activeGuestRequestCount, newRequestCount, newActiveGuestRequestCount] = await Promise.all([
    prisma.request.count(),
    prisma.guestRequest.count({ where: { claimedAt: null } }),
    prisma.request.count({ where: { status: "NEW" } }),
    prisma.guestRequest.count({ where: { status: "NEW", claimedAt: null } })
  ]);

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Обработка заявок</h1>
          <p>Сводка по пользовательским и гостевым заявкам.</p>
        </div>
      </div>

      <div className="admin-metrics">
        <div className="admin-metric-card">
          <span>Пользовательские заявки</span>
          <strong>{requestCount}</strong>
        </div>
        <div className="admin-metric-card">
          <span>Активные гостевые заявки</span>
          <strong>{activeGuestRequestCount}</strong>
        </div>
        <div className="admin-metric-card">
          <span>Новые пользовательские</span>
          <strong>{newRequestCount}</strong>
        </div>
        <div className="admin-metric-card">
          <span>Новые активные гостевые</span>
          <strong>{newActiveGuestRequestCount}</strong>
        </div>
      </div>
    </div>
  );
}
