"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { validatePhone } from "@/lib/contact-validation";

export function CallbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/callback-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, phone })
    });

    const result = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось отправить телефон.");
      return;
    }

    setName("");
    setPhone("");
    setSuccess("Спасибо! Мы с вами свяжемся.");
  }

  return (
    <form className="callback-form" onSubmit={handleSubmit}>
      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="callback-name">Имя</label>
          <input
            id="callback-name"
            name="name"
            value={name}
            placeholder="Как к вам обращаться"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="callback-phone">Телефон</label>
          <input
            id="callback-phone"
            name="phone"
            required
            type="tel"
            value={phone}
            placeholder="+7..."
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}
