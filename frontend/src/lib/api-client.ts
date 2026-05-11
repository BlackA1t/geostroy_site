import { ApiError } from "./api-error";

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = {
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  skipAuthRefresh?: boolean;
};

type InternalRequestOptions = ApiRequestOptions & {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  hasRetried?: boolean;
};

const AUTH_REFRESH_EXCLUDED_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return apiUrl.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = normalizePath(path);
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  if (!text) return undefined;

  return {
    responseText: text.slice(0, 500)
  };
}

function shouldRefreshAuth(path: string, options: InternalRequestOptions) {
  return (
    !options.skipAuthRefresh &&
    !options.hasRetried &&
    !AUTH_REFRESH_EXCLUDED_PATHS.has(normalizePath(path))
  );
}

async function request<T>(path: string, options: InternalRequestOptions): Promise<T> {
  const headers = new Headers(options.headers);
  const init: RequestInit = {
    method: options.method,
    credentials: "include",
    headers
  };

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      init.body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(options.body);
    }
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), init);
  } catch (error) {
    throw ApiError.fromNetworkError(error);
  }

  const payload = await parseResponse(response);

  if (response.ok) {
    return payload as T;
  }

  const error = ApiError.fromResponse(response.status, payload, "Ошибка запроса");

  if (response.status === 401 && shouldRefreshAuth(path, options)) {
    try {
      await request("/auth/refresh", {
        method: "POST",
        skipAuthRefresh: true
      });

      return request<T>(path, {
        ...options,
        hasRetried: true
      });
    } catch (refreshError) {
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }

      throw error;
    }
  }

  throw error;
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "GET"
    });
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body
    });
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body
    });
  },

  delete<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "DELETE"
    });
  }
};
