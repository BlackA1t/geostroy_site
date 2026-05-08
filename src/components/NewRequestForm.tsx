"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/auth";

type NewRequestFormProps = {
  user: SafeUser;
};

export function NewRequestForm({ user }: NewRequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serviceType: formData.get("serviceType"),
        material: formData.get("material"),
        quantity: formData.get("quantity"),
        description: formData.get("description"),
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email")
      })
    });

    const result = await response.json().catch(() => null);

    setIsLoading(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось создать заявку.");
      return;
    }

    router.push(`/dashboard/requests/${result.request.id}`);
    router.refresh();
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="serviceType">Тип услуги</label>
        <input id="serviceType" name="serviceType" type="text" placeholder="Фрезерная обработка с ЧПУ" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="material">Материал</label>
          <input id="material" name="material" type="text" placeholder="Сталь, алюминий, латунь..." />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Количество</label>
          <input id="quantity" name="quantity" type="text" placeholder="Например, 10 шт." />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание задачи</label>
        <textarea
          id="description"
          name="description"
          placeholder="Опишите деталь, требования, сроки и другие важные параметры..."
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Контактное лицо</label>
          <input id="name" name="name" type="text" defaultValue={user.name} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Телефон</label>
          <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={user.email} />
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <button className="btn-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Создание..." : "Создать заявку"}
      </button>
    </form>
  );
}
