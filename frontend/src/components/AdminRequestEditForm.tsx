"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { backendAdminGuestRequestsClient } from "@/lib/backend-admin-guest-requests-client";
import { backendAdminRequestsClient } from "@/lib/backend-admin-requests-client";
import { validatePhone } from "@/lib/contact-validation";
import { QuantityInput } from "./QuantityInput";

type AdminRequestEditFormProps = {
  type: "request" | "guestRequest";
  id: string;
  initialValues: {
    serviceType: string;
    material: string | null;
    quantity: string | number | null;
    description: string;
    name: string;
    phone: string;
    email: string | null;
  };
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AdminRequestEditForm({ type, id, initialValues }: AdminRequestEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phoneError = validatePhone(phone);

    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (email && !isEmail(email)) {
      setError("Неправильный формат email");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        serviceType: formData.get("serviceType"),
        material: formData.get("material"),
        quantity: formData.get("quantity"),
        description: formData.get("description"),
        name: formData.get("name"),
        phone,
        email
      };

      if (type === "request") {
        await backendAdminRequestsClient.updateAdminRequestDetails(id, payload);
      } else {
        await backendAdminGuestRequestsClient.updateAdminGuestRequestDetails(id, payload);
      }

      setSuccess("Изменения сохранены.");
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось сохранить изменения.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-edit-panel">
      <h2>Редактирование данных заявки</h2>
      <form className="request-form admin-request-edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`admin-${type}-serviceType`}>Тип услуги</label>
          <input
            id={`admin-${type}-serviceType`}
            name="serviceType"
            type="text"
            defaultValue={initialValues.serviceType}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`admin-${type}-material`}>Материал</label>
            <input
              id={`admin-${type}-material`}
              name="material"
              type="text"
              defaultValue={initialValues.material ?? ""}
            />
          </div>
          <QuantityInput
            id={`admin-${type}-quantity`}
            name="quantity"
            label="Количество"
            defaultValue={initialValues.quantity ? String(initialValues.quantity) : null}
            placeholder="Например, 10"
          />
        </div>

        <div className="form-group">
          <label htmlFor={`admin-${type}-description`}>Описание</label>
          <textarea
            id={`admin-${type}-description`}
            name="description"
            defaultValue={initialValues.description}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`admin-${type}-name`}>Имя</label>
            <input id={`admin-${type}-name`} name="name" type="text" defaultValue={initialValues.name} required />
          </div>
          <div className="form-group">
            <label htmlFor={`admin-${type}-phone`}>Телефон</label>
            <input id={`admin-${type}-phone`} name="phone" type="tel" defaultValue={initialValues.phone} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor={`admin-${type}-email`}>Email</label>
          <input id={`admin-${type}-email`} name="email" type="email" defaultValue={initialValues.email ?? ""} />
        </div>

        {error ? <div className="auth-error">{error}</div> : null}
        {success ? <div className="form-success">{success}</div> : null}

        <button className="btn-submit" type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </form>
    </section>
  );
}
