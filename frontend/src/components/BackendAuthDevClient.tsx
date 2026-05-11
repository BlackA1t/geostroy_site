"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-error";
import { backendAuthClient } from "@/lib/backend-auth-client";

type ActionName = "register" | "login" | "me" | "refresh" | "logout";

const ACTION_ENDPOINTS: Record<ActionName, string> = {
  register: "POST /auth/register",
  login: "POST /auth/login",
  me: "GET /auth/me",
  refresh: "POST /auth/refresh",
  logout: "POST /auth/logout"
};

function formatResult(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function BackendAuthDevClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [name, setName] = useState("Backend Auth Test");
  const [email, setEmail] = useState(`backend-auth-${Date.now()}@example.com`);
  const [phone, setPhone] = useState("+7 999 123-45-67");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState("");
  const [lastAction, setLastAction] = useState<ActionName | null>(null);
  const [isLoading, setIsLoading] = useState<ActionName | null>(null);

  async function runAction(action: ActionName) {
    setLastAction(action);
    setIsLoading(action);
    setResult("");

    try {
      const response =
        action === "register"
          ? await backendAuthClient.register({ name, email, phone, password })
          : action === "login"
            ? await backendAuthClient.login({ email, password })
            : action === "me"
              ? await backendAuthClient.me()
              : action === "refresh"
                ? await backendAuthClient.refresh()
                : await backendAuthClient.logout();

      setResult(formatResult(response));
    } catch (error) {
      if (error instanceof ApiError) {
        setResult(
          formatResult({
            action,
            endpoint: ACTION_ENDPOINTS[action],
            status: error.status,
            message: error.message,
            details: error.details
          })
        );
      } else {
        setResult(
          formatResult({
            action,
            endpoint: ACTION_ENDPOINTS[action],
            message: error instanceof Error ? error.message : "Unknown error",
            details: error
          })
        );
      }
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="dashboard-wide-card">
      <div className="section-label">Dev</div>
      <h1>Backend auth</h1>
      <p>Тестовая страница для проверки нового NestJS auth API. В публичное меню она не добавлена.</p>
      <div className="dev-api-info">
        <span>API URL</span>
        <strong>{apiUrl || "NEXT_PUBLIC_API_URL не настроен"}</strong>
        {lastAction ? (
          <small>
            Последнее действие: {lastAction} / {ACTION_ENDPOINTS[lastAction]}
          </small>
        ) : null}
      </div>

      <div className="auth-form profile-edit-form">
        <div className="form-group">
          <label htmlFor="backend-auth-name">Имя</label>
          <input id="backend-auth-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="backend-auth-email">Email</label>
          <input
            id="backend-auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="backend-auth-phone">Телефон</label>
          <input id="backend-auth-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="backend-auth-password">Пароль</label>
          <input
            id="backend-auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="dashboard-actions">
          <button className="btn btn-primary" type="button" onClick={() => runAction("register")} disabled={Boolean(isLoading)}>
            {isLoading === "register" ? "Register..." : "Register via backend"}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => runAction("login")} disabled={Boolean(isLoading)}>
            {isLoading === "login" ? "Login..." : "Login via backend"}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => runAction("me")} disabled={Boolean(isLoading)}>
            {isLoading === "me" ? "Me..." : "Me via backend"}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => runAction("refresh")} disabled={Boolean(isLoading)}>
            {isLoading === "refresh" ? "Refresh..." : "Refresh via backend"}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => runAction("logout")} disabled={Boolean(isLoading)}>
            {isLoading === "logout" ? "Logout..." : "Logout via backend"}
          </button>
        </div>
      </div>

      {result ? <pre className="dev-result">{result}</pre> : null}
    </div>
  );
}
