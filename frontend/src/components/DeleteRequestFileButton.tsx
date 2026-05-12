"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api-error";
import { backendAdminGuestRequestsClient } from "@/lib/backend-admin-guest-requests-client";
import { backendAdminRequestsClient } from "@/lib/backend-admin-requests-client";
import { backendRequestsClient } from "@/lib/backend-requests-client";

type DeleteRequestFileButtonProps = {
  entityId: string;
  fileId: string;
  entityType: "request" | "guestRequest";
  mode: "user" | "admin";
  fileName: string;
};

function getDeleteEndpoint({ entityId, entityType, fileId, mode }: DeleteRequestFileButtonProps) {
  if (mode === "user" && entityType === "request") {
    return `/api/requests/${entityId}/files/${fileId}`;
  }

  if (mode === "admin" && entityType === "request") {
    return `/api/admin/requests/${entityId}/files/${fileId}`;
  }

  if (mode === "admin" && entityType === "guestRequest") {
    return `/api/admin/guest-requests/${entityId}/files/${fileId}`;
  }

  return null;
}

export function DeleteRequestFileButton(props: DeleteRequestFileButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const endpoint = getDeleteEndpoint(props);

  async function handleDelete() {
    setError("");

    if (!endpoint) {
      setError("Удаление файла недоступно.");
      return;
    }

    if (!window.confirm(`Удалить файл "${props.fileName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      if (props.mode === "user" && props.entityType === "request") {
        await backendRequestsClient.deleteRequestFile(props.entityId, props.fileId);
      } else if (props.mode === "admin" && props.entityType === "request") {
        await backendAdminRequestsClient.deleteAdminRequestFile(props.entityId, props.fileId);
      } else if (props.mode === "admin" && props.entityType === "guestRequest") {
        await backendAdminGuestRequestsClient.deleteAdminGuestRequestFile(props.entityId, props.fileId);
      } else {
        const response = await fetch(endpoint, {
          method: "DELETE"
        });
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          setError(result?.error ?? result?.message ?? "Не удалось удалить файл.");
          return;
        }
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Не удалось удалить файл.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="request-file-delete">
      <button className="file-delete-button" type="button" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Удаление..." : "Удалить"}
      </button>
      {error ? <span className="request-file-delete-error">{error}</span> : null}
    </div>
  );
}
