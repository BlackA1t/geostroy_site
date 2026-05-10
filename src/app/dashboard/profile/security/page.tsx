import Link from "next/link";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { requireUser } from "@/lib/auth";

export default async function ProfileSecurityPage() {
  await requireUser();

  return (
    <div className="dashboard-wide-card">
      <Link className="btn btn-primary dashboard-back-button" href="/dashboard">
        Назад в личный кабинет
      </Link>

      <div className="dashboard-heading">
        <div>
          <div className="section-label">Безопасность</div>
          <h1>Смена пароля</h1>
          <p>Укажите текущий пароль и задайте новый пароль для входа в личный кабинет.</p>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
