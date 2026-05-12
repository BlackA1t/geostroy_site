"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-error";
import { backendGuestRequestsClient, type BackendGuestRequestResult } from "@/lib/backend-guest-requests-client";
import { validatePhone } from "@/lib/contact-validation";
import { isRequestServiceType, REQUEST_MATERIAL_SUGGESTIONS, REQUEST_SERVICE_TYPES } from "@/lib/request-options";
import { QuantityInput } from "./QuantityInput";

const ACCEPTED_REQUEST_FILES =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.step,.stp,.igs,.iges,.zip,.rar";

type ContactFormProps = {
  initialServiceType?: string;
};

export function ContactForm({ initialServiceType = "" }: ContactFormProps) {
  const defaultServiceType = isRequestServiceType(initialServiceType) ? initialServiceType : "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<BackendGuestRequestResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phoneError = validatePhone(String(formData.get("phone") ?? ""));

    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await backendGuestRequestsClient.createGuestRequest(formData);

      setResult(payload);
      form.reset();
      setIsModalOpen(true);
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }

    return;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="contact-form reveal">
        <h4>Оставить заявку</h4>
        <form id="contactForm" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Ваше имя</label>
              <input name="name" type="text" placeholder="Иван Иванов" required />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="example@mail.ru" />
          </div>

          <div className="form-group">
            <label>Тип услуги</label>
            <select
              name="serviceType"
              defaultValue={defaultServiceType}
              required
            >
              <option value="">Выберите тип услуги</option>
              {REQUEST_SERVICE_TYPES.map((serviceType) => (
                <option key={serviceType} value={serviceType}>
                  {serviceType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Материал</label>
              <input name="material" type="text" list="contact-material-options" placeholder="Сталь, алюминий, латунь..." />
              <datalist id="contact-material-options">
                {REQUEST_MATERIAL_SUGGESTIONS.map((material) => (
                  <option key={material} value={material} />
                ))}
              </datalist>
            </div>
            <QuantityInput id="contact-quantity" name="quantity" label="Количество" placeholder="Например, 10" />
          </div>

          <div className="form-group">
            <label>Описание заказа</label>
            <textarea
              name="description"
              placeholder="Опишите ваш заказ: тип детали, требования, сроки..."
              required
            />
          </div>

          <div className="form-group">
            <label>Файлы</label>
            <input name="files" type="file" accept={ACCEPTED_REQUEST_FILES} multiple />
            <div className="form-hint">Можно прикрепить до 5 файлов, каждый не больше 10 MB.</div>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>
      </div>

      <div
        className={`modal-overlay${isModalOpen ? " active" : ""}`}
        id="modal"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <h4>✅ Заявка отправлена!</h4>
          <p>
            {result?.type === "authenticated"
              ? "Заявка создана и доступна в личном кабинете."
              : "Заявка отправлена. Войдите или зарегистрируйтесь, чтобы отслеживать статус заявки в личном кабинете."}
          </p>
          <div className="modal-actions">
            {result?.type === "authenticated" ? (
              <Link className="btn btn-primary" href="/dashboard/requests">
                Перейти в мои заявки
              </Link>
            ) : (
              <>
                <Link className="btn btn-primary" href="/login">
                  Войти
                </Link>
                <Link className="btn btn-outline" href="/register">
                  Зарегистрироваться
                </Link>
              </>
            )}
            <button className="btn btn-outline" id="modalClose" type="button" onClick={closeModal}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
