import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { NewRequestForm } from "@/components/NewRequestForm";

export default async function NewRequestPage() {
  const user = await requireUser();

  return (
    <main>
      <section className="section dashboard-page dashboard-section">
        <div className="dashboard-wide-card">
          <Link className="btn btn-primary dashboard-back-button" href="/dashboard/requests">
            Мои заявки
          </Link>
          <Link className="btn btn-outline dashboard-back-button" href="/dashboard">
            Личный кабинет
          </Link>
          <div className="dashboard-heading">
            <div>
              <div className="section-label">Новая заявка</div>
              <h1>Создать заявку</h1>
              <p>Опишите задачу, контактные данные уже предзаполнены из вашего профиля.</p>
            </div>
          </div>

          <NewRequestForm user={user} />
        </div>
      </section>
    </main>
  );
}
