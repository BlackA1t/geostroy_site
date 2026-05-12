"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { backendAuthClient } from "@/lib/backend-auth-client";
import { backendGuestRequestsClient } from "@/lib/backend-guest-requests-client";
import { validateOptionalPhone } from "@/lib/contact-validation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("phone") ?? "");
    const phoneError = validateOptionalPhone(phone);

    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await backendAuthClient.register({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone,
        password: String(formData.get("password") ?? "")
      });

      await backendGuestRequestsClient.claimGuestRequest().catch((error) => {
        if (error instanceof ApiError && [400, 404, 409].includes(error.status)) return;
        throw error;
      });

      router.push(result.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось зарегистрироваться.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section className="section auth-page">
        <div className="auth-card">
          <div className="section-label">Регистрация</div>
          <h1>Создать аккаунт</h1>
          <p>Заполните данные, чтобы перейти в личный кабинет.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input id="name" name="name" type="text" autoComplete="name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>

            {error ? <div className="auth-error">{error}</div> : null}

            <button className="btn-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <div className="auth-switch">
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
