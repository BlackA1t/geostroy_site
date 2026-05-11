import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRoleClassName, getUserRoleLabel } from "@/lib/user-role";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();
  const { q: rawQ } = await searchParams;
  const q = String(rawQ ?? "").trim();

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } }
        ]
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          requests: true
        }
      }
    }
  });

  return (
    <div className="admin-container">
      <div className="admin-heading">
        <div>
          <div className="section-label">Админ-панель</div>
          <h1>Пользователи</h1>
          <p>Список аккаунтов, их роли и связанные пользовательские заявки.</p>
        </div>
      </div>

      <div className="request-toolbar">
        <form className="request-search" action="/admin/users">
          <label htmlFor="admin-user-search">Поиск</label>
          <div>
            <input
              id="admin-user-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Имя, email или телефон"
            />
            <button className="btn btn-primary" type="submit">
              Найти
            </button>
          </div>
        </form>
      </div>

      <div className="admin-list">
        {users.map((user) => (
          <article className="admin-list-card user-admin-card" key={user.id}>
            <div className="admin-list-main">
              <div className="request-card-top">
                <span className="request-id">{user.name}</span>
                <span className={`status-badge ${getUserRoleClassName(user.role)}`}>
                  {getUserRoleLabel(user.role)}
                </span>
              </div>
              <h2>{user.email}</h2>
              <div className="admin-list-meta">
                <span>Телефон: {user.phone || "не указан"}</span>
                <span>Дата регистрации: {formatDate(user.createdAt)}</span>
                <span>Заявок: {user._count.requests}</span>
              </div>
            </div>
            <Link className="btn btn-outline request-details-link" href={`/admin/users/${user.id}`}>
              Открыть
            </Link>
          </article>
        ))}
        {users.length === 0 ? (
          <div className="requests-empty">
            <h2>Пользователи не найдены</h2>
            <p>{q ? "Попробуйте изменить поисковый запрос." : "Пользователей пока нет."}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
