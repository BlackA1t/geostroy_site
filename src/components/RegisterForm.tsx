"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { validateOptionalPhone } from "@/lib/contact-validation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const phoneError = validateOptionalPhone(String(formData.get("phone") ?? ""));

    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password")
      })
    });

    const result = await response.json().catch(() => null);

    setIsLoading(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось зарегистрироваться.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
