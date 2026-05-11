import type { ConfigService } from "@nestjs/config";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge?: number;
  domain?: string;
};

export function getAuthCookieOptions(configService: ConfigService, maxAge?: number): CookieOptions {
  const domain = configService.get<string>("COOKIE_DOMAIN");

  return {
    httpOnly: true,
    secure: configService.get<boolean>("COOKIE_SECURE", false),
    sameSite: "lax",
    path: "/",
    maxAge,
    ...(domain ? { domain } : {})
  };
}
