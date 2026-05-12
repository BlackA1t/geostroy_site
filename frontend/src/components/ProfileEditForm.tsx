"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { SafeUser } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { backendUserClient } from "@/lib/backend-user-client";
import { validateOptionalPhone } from "@/lib/contact-validation";

type ProfileEditFormProps = {
  user: SafeUser;
};

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const phoneError = validateOptionalPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSaving(true);

    try {
      await backendUserClient.updateMe({
        name,
        phone
      });

      setSuccess("Данные успешно обновлены");
      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось обновить данные.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="auth-form profile-edit-form" onSubmit={handleSubmit}>
      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}

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
        <input id="profile-email" name="email" type="email" value={user.email} readOnly />
        <small className="form-hint">Email используется для входа и на этом этапе не редактируется.</small>
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
