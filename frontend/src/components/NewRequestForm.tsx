"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import type { SafeUser } from "@/lib/auth";
import { backendRequestsClient } from "@/lib/backend-requests-client";
import { validatePhone } from "@/lib/contact-validation";
import { QuantityInput } from "./QuantityInput";

const ACCEPTED_REQUEST_FILES =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.step,.stp,.igs,.iges,.zip,.rar";

type NewRequestFormProps = {
  initialServiceType?: string;
  user: SafeUser;
};

export function NewRequestForm({ initialServiceType = "", user }: NewRequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const phoneError = validatePhone(String(formData.get("phone") ?? ""));

    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await backendRequestsClient.createRequest(formData);

      router.push(`/dashboard/requests/${result.request.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось создать заявку.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="serviceType">Тип услуги</label>
        <input
          id="serviceType"
          name="serviceType"
          type="text"
          defaultValue={initialServiceType}
          placeholder="Фрезерная обработка с ЧПУ"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="material">Материал</label>
          <input id="material" name="material" type="text" placeholder="Сталь, алюминий, латунь..." />
        </div>
        <QuantityInput id="quantity" name="quantity" label="Количество" placeholder="Например, 10" />
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

      <div className="form-group">
        <label htmlFor="files">Файлы</label>
        <input id="files" name="files" type="file" accept={ACCEPTED_REQUEST_FILES} multiple />
        <div className="form-hint">До 5 файлов, каждый не больше 10 MB.</div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <button className="btn-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Создание..." : "Создать заявку"}
      </button>
    </form>
  );
}
