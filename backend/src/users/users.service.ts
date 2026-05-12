import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { hashPassword, verifyPassword } from "../common/utils/password";
import { validateOptionalPhone } from "../common/utils/phone";
import { PrismaService } from "../prisma/prisma.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { toSafeUser } from "./user-response";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.findUserOrThrow(userId);

    return toSafeUser(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    await this.findUserOrThrow(userId);

    const data: {
      name?: string;
      phone?: string | null;
    } = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException("Укажите имя");
      }

      data.name = name;
    }

    if (dto.phone !== undefined) {
      const phone = dto.phone?.trim() ?? "";
      const phoneError = validateOptionalPhone(phone);

      if (phoneError) {
        throw new BadRequestException(phoneError);
      }

      data.phone = phone || null;
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId
      },
      data
    });

    return toSafeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Пароли не совпадают");
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException("Новый пароль должен отличаться от текущего");
    }

    const user = await this.findUserOrThrow(userId);
    const isCurrentPasswordValid = await verifyPassword(dto.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Текущий пароль указан неверно");
    }

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        passwordHash: await hashPassword(dto.newPassword)
      }
    });

    return {
      success: true
    };
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден.");
    }

    return user;
  }
}
