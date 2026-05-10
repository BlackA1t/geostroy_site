"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { SafeUser } from "@/lib/auth";
import { validateOptionalPhone } from "@/lib/contact-validation";

type ProfileEditFormProps = {
  user: SafeUser;
};

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const phoneError = validateOptionalPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, phone })
    });

    const result = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось обновить данные.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="auth-form profile-edit-form" onSubmit={handleSubmit}>
      {error ? <div className="auth-error">{error}</div> : null}
      <div className="form-group">
        <label htmlFor="profile-name">Имя</label>
        <input
          id="profile-name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="profile-phone">Телефон</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <button className="btn-submit" type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить данные"}
      </button>
    </form>
  );
}
