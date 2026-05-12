"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { backendAuthClient } from "@/lib/backend-auth-client";
import { backendGuestRequestsClient } from "@/lib/backend-guest-requests-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await backendAuthClient.login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      });

      await backendGuestRequestsClient.claimGuestRequest().catch((error) => {
        if (error instanceof ApiError && [400, 404, 409].includes(error.status)) return;
        throw error;
      });

      router.push(result.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось войти.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section className="section auth-page">
        <div className="auth-card">
          <div className="section-label">Вход</div>
          <h1>Войти в аккаунт</h1>
          <p>Введите email и пароль, чтобы открыть личный кабинет.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>

            {error ? <div className="auth-error">{error}</div> : null}

            <button className="btn-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="auth-switch">
            Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
