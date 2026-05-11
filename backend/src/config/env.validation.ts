type BackendEnvironment = {
  NODE_ENV: string;
  BACKEND_PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  COOKIE_DOMAIN?: string;
  COOKIE_SECURE: boolean;
};

const REQUIRED_ENV_KEYS = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "FRONTEND_URL"] as const;

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return value === "true";
}

export function envValidation(config: Record<string, unknown>): BackendEnvironment {
  for (const key of REQUIRED_ENV_KEYS) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const nodeEnv = String(config.NODE_ENV ?? "development");
  if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be one of: development, test, production");
  }

  const backendPort = Number(config.BACKEND_PORT ?? 4000);
  if (!Number.isInteger(backendPort) || backendPort <= 0) {
    throw new Error("BACKEND_PORT must be a positive number");
  }

  return {
    NODE_ENV: nodeEnv,
    BACKEND_PORT: backendPort,
    FRONTEND_URL: String(config.FRONTEND_URL),
    DATABASE_URL: String(config.DATABASE_URL),
    JWT_ACCESS_SECRET: String(config.JWT_ACCESS_SECRET),
    JWT_REFRESH_SECRET: String(config.JWT_REFRESH_SECRET),
    JWT_ACCESS_EXPIRES_IN: String(config.JWT_ACCESS_EXPIRES_IN ?? "15m"),
    JWT_REFRESH_EXPIRES_IN: String(config.JWT_REFRESH_EXPIRES_IN ?? "30d"),
    COOKIE_DOMAIN: config.COOKIE_DOMAIN ? String(config.COOKIE_DOMAIN) : undefined,
    COOKIE_SECURE: parseBoolean(config.COOKIE_SECURE ? String(config.COOKIE_SECURE) : undefined, false)
  };
}
