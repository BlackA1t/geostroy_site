import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverviewFromBackend } from "@/lib/backend-admin-overview-server";

export default async function AdminPage() {
  await requireAdmin();

  const { newRequestCount, newActiveGuestRequestCount, newCallbackRequestCount } =
    await getAdminOverviewFromBackend();

  const overviewCards = [
    {
      title: "Новые пользовательские заявки",
      count: newRequestCount,
      description: "Заявки зарегистрированных пользователей",
      href: "/admin/requests?status=NEW"
    },
    {
      title: "Новые гостевые заявки",
      count: newActiveGuestRequestCount,
      description: "Заявки, отправленные без регистрации",
      href: "/admin/guest-requests?status=NEW"
    },
    {
      title: "Новые обратные звонки",
      count: newCallbackRequestCount,
      description: "Клиенты, которые оставили номер телефона",
      href: "/admin/callback-requests?status=NEW"
    }
  ];

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Обработка заявок</h1>
          <p>Быстрый обзор новых обращений, которые требуют обработки.</p>
        </div>
      </div>

      <div className="admin-metrics">
        {overviewCards.map((card) => (
          <Link className="admin-metric-card admin-overview-card" href={card.href} key={card.title}>
            <span>{card.title}</span>
            <strong>{card.count}</strong>
            <p>{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
