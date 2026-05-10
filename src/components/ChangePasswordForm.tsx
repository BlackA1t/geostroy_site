"use client";

import type { FormEvent } from "react";
import { useState } from "react";

function validatePasswordForm(currentPassword: string, newPassword: string, confirmPassword: string) {
  if (!currentPassword) return "Укажите текущий пароль";
  if (!newPassword) return "Укажите новый пароль";
  if (!confirmPassword) return "Повторите новый пароль";
  if (newPassword.length < 8) return "Новый пароль должен содержать не менее 8 символов";
  if (newPassword !== confirmPassword) return "Пароли не совпадают";
  if (newPassword === currentPassword) return "Новый пароль должен отличаться от текущего";

  return "";
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validatePasswordForm(currentPassword, newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      })
    });

    const result = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось изменить пароль.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("Пароль успешно изменён");
  }

  return (
    <form className="auth-form change-password-form" onSubmit={handleSubmit}>
      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}

      <div className="form-group">
        <label htmlFor="current-password">Текущий пароль</label>
        <input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="new-password">Новый пароль</label>
        <input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirm-password">Повторите новый пароль</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <button className="btn-submit" type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить пароль"}
      </button>
    </form>
  );
}
