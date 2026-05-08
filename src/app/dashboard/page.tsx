import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main>
      <section className="section dashboard-page">
        <div className="dashboard-card">
          <div className="section-label">Личный кабинет</div>
          <h1>Здравствуйте, {user.name}</h1>
          <p>Здесь отображаются основные данные вашего аккаунта.</p>

          <div className="dashboard-info">
            <div>
              <span>Имя</span>
              <strong>{user.name}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            {user.phone ? (
              <div>
                <span>Телефон</span>
                <strong>{user.phone}</strong>
              </div>
            ) : null}
            <div>
              <span>Роль</span>
              <strong>{user.role}</strong>
            </div>
            <div>
              <span>Дата регистрации</span>
              <strong>{user.createdAt.toLocaleDateString("ru-RU")}</strong>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link className="btn btn-primary" href="/dashboard/requests">
              Мои заявки
            </Link>
            <Link className="btn btn-outline" href="/dashboard/requests/new">
              Создать заявку
            </Link>
          </div>

          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
