"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type ContactRequestResult =
  | {
      type: "authenticated";
      message: string;
      requestId: string;
    }
  | {
      type: "guest";
      message: string;
      guestRequestId: string;
    };

const ACCEPTED_REQUEST_FILES =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.step,.stp,.igs,.iges,.zip,.rar";

export function ContactForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<ContactRequestResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact-request", {
      method: "POST",
      body: formData
    });

    const payload = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.");
      return;
    }

    setResult(payload);
    form.reset();
    setIsModalOpen(true);
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
            <input name="serviceType" type="text" placeholder="Фрезерная обработка с ЧПУ" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Материал</label>
              <input name="material" type="text" placeholder="Сталь, алюминий, латунь..." />
            </div>
            <div className="form-group">
              <label>Количество</label>
              <input name="quantity" type="text" placeholder="Например, 10 шт." />
            </div>
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
