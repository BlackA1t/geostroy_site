"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Request, RequestFile } from "@prisma/client";
import { validatePhone } from "@/lib/contact-validation";
import { QuantityInput } from "./QuantityInput";

const ACCEPTED_REQUEST_FILES =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.step,.stp,.igs,.iges,.zip,.rar";

type EditRequestFormProps = {
  request: Request & {
    files: RequestFile[];
  };
};

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes) return "";
  if (sizeBytes < 1024 * 1024) return `${Math.ceil(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export function EditRequestForm({ request }: EditRequestFormProps) {
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

    const response = await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      body: formData
    });

    const result = await response.json().catch(() => null);

    setIsLoading(false);

    if (!response.ok) {
      setError(result?.error ?? "Не удалось сохранить заявку.");
      return;
    }

    router.push(`/dashboard/requests/${request.id}`);
    router.refresh();
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="serviceType">Тип услуги</label>
        <input id="serviceType" name="serviceType" type="text" defaultValue={request.serviceType} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="material">Материал</label>
          <input id="material" name="material" type="text" defaultValue={request.material ?? ""} />
        </div>
        <QuantityInput
          id="quantity"
          name="quantity"
          label="Количество"
          defaultValue={request.quantity}
          placeholder="Например, 10"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание задачи</label>
        <textarea id="description" name="description" defaultValue={request.description} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Контактное лицо</label>
          <input id="name" name="name" type="text" defaultValue={request.name} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Телефон</label>
          <input id="phone" name="phone" type="tel" defaultValue={request.phone} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={request.email ?? ""} />
      </div>

      <div className="request-files-panel">
        <h2>Текущие файлы</h2>
        {request.files.length === 0 ? (
          <p>Файлы пока не прикреплены.</p>
        ) : (
          <div className="request-files-list">
            {request.files.map((file) => (
              <div className="request-file-item" key={file.id}>
                <div>
                  <strong>{file.originalName || file.fileName}</strong>
                  <span>
                    {[file.fileType, formatFileSize(file.sizeBytes)].filter(Boolean).join(" · ") || "Файл"}
                  </span>
                </div>
                <a href={file.fileUrl} target="_blank" rel="noreferrer">
                  Открыть
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="files">Добавить файлы</label>
        <input id="files" name="files" type="file" accept={ACCEPTED_REQUEST_FILES} multiple />
        <div className="form-hint">Можно добавить до 5 новых файлов за одно сохранение.</div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      <button className="btn-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Сохранение..." : "Сохранить изменения"}
      </button>
    </form>
  );
}
