export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  static fromResponse(status: number, payload: unknown, fallbackMessage = "Ошибка запроса") {
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return new ApiError(status, message.join(", "), payload);
      }

      if (typeof message === "string" && message.trim()) {
        return new ApiError(status, message, payload);
      }
    }

    if (payload && typeof payload === "object" && "error" in payload) {
      const error = (payload as { error?: unknown }).error;

      if (typeof error === "string" && error.trim()) {
        return new ApiError(status, error, payload);
      }
    }

    return new ApiError(status, fallbackMessage, payload);
  }

  static fromNetworkError(error: unknown) {
    return new ApiError(
      0,
      "Не удалось подключиться к backend. Проверьте, что backend запущен и NEXT_PUBLIC_API_URL настроен.",
      error instanceof Error ? { name: error.name, message: error.message } : error
    );
  }
}
