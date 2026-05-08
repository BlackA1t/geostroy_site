"use client";

import { FormEvent, useEffect, useState } from "react";

export function ContactForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
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
              <input type="text" placeholder="Иван Иванов" required />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input type="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="example@mail.ru" />
          </div>

          <div className="form-group">
            <label>Описание заказа</label>
            <textarea placeholder="Опишите ваш заказ: тип детали, материал, количество, сроки..." />
          </div>

          <button type="submit" className="btn-submit">
            Отправить заявку
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
          <p>Спасибо за обращение. Наш специалист свяжется с вами в ближайшее время.</p>
          <button className="btn btn-primary" id="modalClose" type="button" onClick={closeModal}>
            Закрыть
          </button>
        </div>
      </div>
    </>
  );
}
