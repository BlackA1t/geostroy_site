import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TokenService } from "./token.service";
import { validateOptionalPhone } from "../common/utils/phone";
import { hashPassword, verifyPassword } from "../common/utils/password";
import { PrismaService } from "../prisma/prisma.service";
import { toSafeUser } from "../users/user-response";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;
    const phoneError = validateOptionalPhone(phone);

    if (phoneError) {
      throw new BadRequestException(phoneError);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name?.trim() || email.split("@")[0],
        email,
        phone,
        passwordHash,
        role: "USER"
      }
    });

    const tokens = await this.tokenService.issueTokens(user);

    return {
      user: toSafeUser(user),
      tokens
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const isPasswordValid = await verifyPassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const tokens = await this.tokenService.issueTokens(user);

    return {
      user: toSafeUser(user),
      tokens
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден.");
    }

    return toSafeUser(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден.");
    }

    const tokens = await this.tokenService.rotateRefreshToken(refreshToken, user);

    return {
      user: toSafeUser(user),
      tokens
    };
  }

  async logout(refreshToken?: string | null) {
    await this.tokenService.deleteRefreshSession(refreshToken);

    return {
      success: true
    };
  }
}
