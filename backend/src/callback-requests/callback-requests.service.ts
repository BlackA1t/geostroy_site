import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CallbackStatus, Prisma } from "@prisma/client";
import { validateOptionalPhone } from "../common/utils/phone";
import { parseRequestNumberSearch } from "../common/utils/request-number";
import { isCallbackStatus } from "../common/utils/callback-status";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCallbackRequestDto } from "./dto/create-callback-request.dto";
import { UpdateCallbackRequestDto } from "./dto/update-callback-request.dto";

@Injectable()
export class CallbackRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCallbackRequest(dto: CreateCallbackRequestDto) {
    const phone = String(dto.phone ?? "").trim();
    const name = this.normalizeOptionalString(dto.name);

    if (!phone) {
      throw new BadRequestException("Укажите телефон");
    }

    const phoneError = validateOptionalPhone(phone);
    if (phoneError) {
      throw new BadRequestException(phoneError);
    }

    const callbackRequest = await this.prisma.callbackRequest.create({
      data: {
        name,
        phone,
        status: CallbackStatus.NEW,
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: CallbackStatus.NEW,
            comment: null
          }
        }
      }
    });

    return { success: true, callbackRequestId: callbackRequest.id };
  }

  async getAdminCallbackRequests(filters: { q?: string; status?: string }) {
    const q = String(filters.q ?? "").trim();
    const statusFilter = isCallbackStatus(filters.status) ? filters.status : null;
    const callbackRequestNumberSearch = parseRequestNumberSearch(q);

    const where: Prisma.CallbackRequestWhereInput = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              ...(callbackRequestNumberSearch ? [{ callbackRequestNumber: callbackRequestNumberSearch }] : [])
            ]
          }
        : {})
    };

    const callbackRequests = await this.prisma.callbackRequest.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        statusHistory: {
          where: {
            comment: {
              not: null
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    return { callbackRequests };
  }

  async getAdminCallbackRequest(id: string) {
    const callbackRequest = await this.prisma.callbackRequest.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: {
            createdAt: "asc"
          },
          include: {
            changedBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!callbackRequest) {
      throw new NotFoundException("Обращение не найдено.");
    }

    return { callbackRequest };
  }

  async updateAdminCallbackRequest(adminId: string, id: string, dto: UpdateCallbackRequestDto) {
    const comment = typeof dto.comment === "string" ? dto.comment.trim().slice(0, 1000) : "";
    const existingRequest = await this.prisma.callbackRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new NotFoundException("Обращение не найдено.");
    }

    const nextStatus = dto.status === undefined || dto.status === null || dto.status === ""
      ? existingRequest.status
      : dto.status;

    if (!isCallbackStatus(nextStatus)) {
      throw new BadRequestException("Некорректный статус.");
    }

    if (existingRequest.status === nextStatus && !comment) {
      throw new BadRequestException("Измените статус или добавьте комментарий.");
    }

    const callbackRequest = await this.prisma.$transaction(async (tx) => {
      const updated = existingRequest.status === nextStatus
        ? existingRequest
        : await tx.callbackRequest.update({
            where: { id },
            data: { status: nextStatus }
          });

      await tx.callbackRequestStatusHistory.create({
        data: {
          callbackRequestId: id,
          oldStatus: existingRequest.status,
          newStatus: nextStatus,
          comment: comment || null,
          changedById: adminId
        }
      });

      return updated;
    });

    return { callbackRequest, success: true };
  }

  private normalizeOptionalString(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  }
}
