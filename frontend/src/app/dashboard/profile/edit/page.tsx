import Link from "next/link";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { requireUser } from "@/lib/auth";

export default async function ProfileEditPage() {
  const user = await requireUser();

  return (
    <div className="dashboard-wide-card">
      <Link className="btn btn-primary dashboard-back-button" href="/dashboard">
        Личный кабинет
      </Link>
      <div className="dashboard-heading">
        <div>
          <div className="section-label">Профиль</div>
          <h1>Редактировать данные</h1>
          <p>Измените контактные данные аккаунта. Роль и пароль здесь не редактируются.</p>
        </div>
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}
