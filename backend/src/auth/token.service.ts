import { createHash } from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Role, User } from "@prisma/client";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
  DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_COOKIE
} from "./auth.constants";
import { getAuthCookieOptions } from "./cookie-options";
import { PrismaService } from "../prisma/prisma.service";

export type AccessTokenPayload = {
  sub: string;
  role: Role;
  email: string;
};

export type RefreshTokenPayload = {
  sub: string;
  type: "refresh";
};

type AuthTokenUser = Pick<User, "id" | "email" | "role">;

type CookieResponse = {
  cookie(name: string, value: string, options: unknown): void;
  clearCookie(name: string, options: unknown): void;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async issueTokens(user: AuthTokenUser) {
    const accessTokenExpiresIn = this.configService.get<string>(
      "JWT_ACCESS_EXPIRES_IN",
      DEFAULT_ACCESS_TOKEN_EXPIRES_IN
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      "JWT_REFRESH_EXPIRES_IN",
      DEFAULT_REFRESH_TOKEN_EXPIRES_IN
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        email: user.email
      } satisfies AccessTokenPayload,
      {
        secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessTokenExpiresIn as never
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: "refresh"
      } satisfies RefreshTokenPayload,
      {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshTokenExpiresIn as never
      }
    );

    const refreshMaxAge = this.getDurationMs(refreshTokenExpiresIn);
    const accessMaxAge = this.getDurationMs(accessTokenExpiresIn);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshMaxAge)
      }
    });

    return {
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge
    };
  }

  setAuthCookies(response: CookieResponse, tokens: Awaited<ReturnType<TokenService["issueTokens"]>>) {
    response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, getAuthCookieOptions(this.configService, tokens.accessMaxAge));
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      getAuthCookieOptions(this.configService, tokens.refreshMaxAge)
    );
  }

  clearAuthCookies(response: CookieResponse) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, getAuthCookieOptions(this.configService));
    response.clearCookie(REFRESH_TOKEN_COOKIE, getAuthCookieOptions(this.configService));
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET")
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Некорректный refresh token.");
      }

      return payload;
    } catch {
      throw new UnauthorizedException("Некорректный refresh token.");
    }
  }

  async rotateRefreshToken(refreshToken: string, user: AuthTokenUser) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: {
        tokenHash
      },
      select: {
        id: true,
        expiresAt: true
      }
    });

    if (!session) {
      throw new UnauthorizedException("Сессия не найдена.");
    }

    if (session.expiresAt <= new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      throw new UnauthorizedException("Сессия истекла.");
    }

    await this.prisma.session.delete({
      where: {
        id: session.id
      }
    });

    return this.issueTokens(user);
  }

  async deleteRefreshSession(refreshToken?: string | null) {
    if (!refreshToken) return;

    await this.prisma.session
      .delete({
        where: {
          tokenHash: this.hashRefreshToken(refreshToken)
        }
      })
      .catch(() => undefined);
  }

  private getDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());

    if (!match) {
      throw new Error(`Unsupported token duration: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
  }
}
