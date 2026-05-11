import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { REFRESH_TOKEN_COOKIE } from "./auth.constants";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TokenService } from "./token.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AccessTokenPayload } from "./token.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: any) {
    const result = await this.authService.register(dto);
    this.tokenService.setAuthCookies(response, result.tokens);

    return {
      user: result.user
    };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: any) {
    const result = await this.authService.login(dto);
    this.tokenService.setAuthCookies(response, result.tokens);

    return {
      user: result.user
    };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AccessTokenPayload) {
    return {
      user: await this.authService.me(user.sub)
    };
  }

  @Post("refresh")
  async refresh(@Req() request: any, @Res({ passthrough: true }) response: any) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException("Необходим refresh token.");
    }

    const result = await this.authService.refresh(refreshToken);
    this.tokenService.setAuthCookies(response, result.tokens);

    return {
      user: result.user
    };
  }

  @Post("logout")
  async logout(@Req() request: any, @Res({ passthrough: true }) response: any) {
    await this.authService.logout(request.cookies?.[REFRESH_TOKEN_COOKIE]);
    this.tokenService.clearAuthCookies(response);

    return {
      success: true
    };
  }
}
