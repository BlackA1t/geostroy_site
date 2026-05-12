import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CallbackStatus, Prisma, RequestStatus, Role } from "@prisma/client";
import {
  buildAdminRequestEditComment,
  getAdminRequestDetailsChanges,
  parseAdminRequestDetailsInput
} from "../common/utils/admin-request-edit";
import { deleteUploadedRequestFile, RequestFileValidationError } from "../common/utils/request-files";
import { parseRequestNumberSearch, formatRequestTitle } from "../common/utils/request-number";
import { getRequestStatusLabel, isRequestStatus } from "../common/utils/request-status";
import { isUserRole } from "../common/utils/user-role";
import { PrismaService } from "../prisma/prisma.service";
import { toSafeUser } from "../users/user-response";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [newRequestCount, newActiveGuestRequestCount, newCallbackRequestCount] = await Promise.all([
      this.prisma.request.count({
        where: {
          status: RequestStatus.NEW
        }
      }),
      this.prisma.guestRequest.count({
        where: {
          status: RequestStatus.NEW,
          claimedAt: null
        }
      }),
      this.prisma.callbackRequest.count({
        where: {
          status: CallbackStatus.NEW
        }
      })
    ]);

    return {
      newRequestCount,
      newActiveGuestRequestCount,
      newCallbackRequestCount
    };
  }

  async getUsers(filters: { q?: string }) {
    const q = String(filters.q ?? "").trim();

    const users = await this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } }
            ]
          }
        : {},
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            requests: true
          }
        }
      }
    });

    return { users };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        requests: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            requestNumber: true,
            status: true,
            serviceType: true,
            material: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    const { requests, ...safeUser } = user;

    return { user: safeUser, requests };
  }

  async updateUserRole(adminId: string, id: string, body: unknown) {
    const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const role = input.role;

    if (!isUserRole(role)) {
      throw new BadRequestException("Некорректная роль.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    if (user.role === role) {
      return { success: true, user: toSafeUser(user) };
    }

    if (user.id === adminId && user.role === Role.ADMIN && role === Role.USER) {
      const otherAdminsCount = await this.prisma.user.count({
        where: {
          role: Role.ADMIN,
          id: {
            not: adminId
          }
        }
      });

      if (otherAdminsCount === 0) {
        throw new BadRequestException("Нельзя снять роль администратора с последнего администратора");
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role }
    });

    return { success: true, user: toSafeUser(updatedUser) };
  }

  async getRequests(filters: { q?: string; status?: string }) {
    const q = String(filters.q ?? "").trim();
    const statusFilter = isRequestStatus(filters.status) ? filters.status : null;
    const requestNumberSearch = parseRequestNumberSearch(q);

    const where: Prisma.RequestWhereInput = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { serviceType: { contains: q, mode: "insensitive" } },
              { material: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              ...(requestNumberSearch ? [{ requestNumber: requestNumberSearch }] : [])
            ]
          }
        : {})
    };

    const requests = await this.prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            files: true
          }
        }
      }
    });

    return { requests };
  }

  async getRequest(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        files: {
          orderBy: {
            createdAt: "desc"
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
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

    if (!request) {
      throw new NotFoundException("Заявка не найдена.");
    }

    return { request };
  }

  async updateRequestStatus(adminId: string, id: string, body: unknown) {
    const input = this.parseStatusBody(body);
    const existingRequest = await this.prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new NotFoundException("Заявка не найдена.");
    }

    const nextStatus = input.status ?? existingRequest.status;

    if (existingRequest.status === nextStatus && !input.comment) {
      throw new BadRequestException("Измените статус или добавьте комментарий.");
    }

    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const updated = existingRequest.status === nextStatus
        ? existingRequest
        : await tx.request.update({
            where: { id },
            data: { status: nextStatus }
          });

      await tx.requestStatusHistory.create({
        data: {
          requestId: id,
          oldStatus: existingRequest.status,
          newStatus: nextStatus,
          comment: input.comment,
          changedById: adminId,
          actorType: "ADMIN"
        }
      });

      if (existingRequest.userId && existingRequest.status !== nextStatus) {
        const statusLabel = getRequestStatusLabel(nextStatus);
        await tx.notification.create({
          data: {
            userId: existingRequest.userId,
            requestId: id,
            title: formatRequestTitle(existingRequest.requestNumber),
            message: `Статус вашей заявки изменён на ${statusLabel}${input.comment ? ` Комментарий: ${input.comment}` : ""}`,
            type: "STATUS_CHANGED"
          }
        });
      }

      return updated;
    });

    return { request: updatedRequest };
  }

  async updateRequestDetails(adminId: string, id: string, body: unknown) {
    const existingRequest = await this.prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new NotFoundException("Заявка не найдена.");
    }

    const input = parseAdminRequestDetailsInput(body);
    const changes = getAdminRequestDetailsChanges(existingRequest, input);

    if (changes.length === 0) {
      throw new BadRequestException("Нет изменений для сохранения.");
    }

    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id },
        data: input
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId: id,
          oldStatus: existingRequest.status,
          newStatus: existingRequest.status,
          comment: buildAdminRequestEditComment(changes),
          changedById: adminId,
          actorType: "ADMIN"
        }
      });

      return updated;
    });

    return { request: updatedRequest, success: true };
  }

  async deleteRequestFile(adminId: string, id: string, fileId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        status: true
      }
    });

    if (!request) {
      throw new NotFoundException("Заявка не найдена.");
    }

    const file = await this.prisma.requestFile.findFirst({
      where: {
        id: fileId,
        requestId: request.id
      },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        originalName: true
      }
    });

    if (!file) {
      throw new NotFoundException("Файл не найден.");
    }

    await this.deletePhysicalFile(file.fileUrl);
    const fileLabel = file.originalName || file.fileName;

    await this.prisma.$transaction([
      this.prisma.requestFile.delete({
        where: { id: file.id }
      }),
      this.prisma.requestStatusHistory.create({
        data: {
          requestId: request.id,
          oldStatus: request.status,
          newStatus: request.status,
          actorType: "ADMIN",
          changedById: adminId,
          comment: `Администратор удалил файл: ${fileLabel}`
        }
      })
    ]);

    return { success: true };
  }

  async getGuestRequests(filters: { q?: string; status?: string }) {
    const q = String(filters.q ?? "").trim();
    const statusFilter = isRequestStatus(filters.status) ? filters.status : null;
    const guestRequestNumberSearch = parseRequestNumberSearch(q);

    const where: Prisma.GuestRequestWhereInput = {
      claimedAt: null,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { serviceType: { contains: q, mode: "insensitive" } },
              { material: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              ...(guestRequestNumberSearch ? [{ guestRequestNumber: guestRequestNumberSearch }] : [])
            ]
          }
        : {})
    };

    const guestRequests = await this.prisma.guestRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            files: true
          }
        }
      }
    });

    return { guestRequests };
  }

  async getGuestRequest(id: string) {
    const guestRequest = await this.prisma.guestRequest.findUnique({
      where: { id },
      include: {
        files: {
          orderBy: {
            createdAt: "desc"
          }
        },
        claimedBy: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        convertedRequest: {
          select: {
            requestNumber: true
          }
        },
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

    if (!guestRequest) {
      throw new NotFoundException("Гостевая заявка не найдена.");
    }

    return { guestRequest };
  }

  async updateGuestRequestStatus(adminId: string, id: string, body: unknown) {
    const input = this.parseStatusBody(body);
    const existingGuestRequest = await this.prisma.guestRequest.findUnique({
      where: { id }
    });

    if (!existingGuestRequest) {
      throw new NotFoundException("Гостевая заявка не найдена.");
    }

    if (existingGuestRequest.claimedAt) {
      throw new ConflictException("Гостевая заявка уже привязана к пользователю.");
    }

    const nextStatus = input.status ?? existingGuestRequest.status;

    if (existingGuestRequest.status === nextStatus && !input.comment) {
      throw new BadRequestException("Измените статус или добавьте комментарий.");
    }

    const updatedGuestRequest = await this.prisma.$transaction(async (tx) => {
      const updated = existingGuestRequest.status === nextStatus
        ? existingGuestRequest
        : await tx.guestRequest.update({
            where: { id },
            data: { status: nextStatus }
          });

      await tx.requestStatusHistory.create({
        data: {
          guestRequestId: id,
          oldStatus: existingGuestRequest.status,
          newStatus: nextStatus,
          comment: input.comment,
          changedById: adminId,
          actorType: "ADMIN"
        }
      });

      return updated;
    });

    return { guestRequest: updatedGuestRequest };
  }

  async updateGuestRequestDetails(adminId: string, id: string, body: unknown) {
    const existingRequest = await this.prisma.guestRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      throw new NotFoundException("Гостевая заявка не найдена.");
    }

    if (existingRequest.claimedAt) {
      throw new ConflictException("Гостевая заявка уже привязана к пользователю.");
    }

    const input = parseAdminRequestDetailsInput(body);
    const changes = getAdminRequestDetailsChanges(existingRequest, input);

    if (changes.length === 0) {
      throw new BadRequestException("Нет изменений для сохранения.");
    }

    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.guestRequest.update({
        where: { id },
        data: input
      });

      await tx.requestStatusHistory.create({
        data: {
          guestRequestId: id,
          oldStatus: existingRequest.status,
          newStatus: existingRequest.status,
          comment: buildAdminRequestEditComment(changes),
          changedById: adminId,
          actorType: "ADMIN"
        }
      });

      return updated;
    });

    return { guestRequest: updatedRequest, success: true };
  }

  async deleteGuestRequestFile(adminId: string, id: string, fileId: string) {
    const guestRequest = await this.prisma.guestRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        claimedAt: true
      }
    });

    if (!guestRequest) {
      throw new NotFoundException("Гостевая заявка не найдена.");
    }

    if (guestRequest.claimedAt) {
      throw new ConflictException("Гостевая заявка уже привязана к пользователю.");
    }

    const file = await this.prisma.guestRequestFile.findFirst({
      where: {
        id: fileId,
        guestRequestId: guestRequest.id
      },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        originalName: true
      }
    });

    if (!file) {
      throw new NotFoundException("Файл не найден.");
    }

    await this.deletePhysicalFile(file.fileUrl);
    const fileLabel = file.originalName || file.fileName;

    await this.prisma.$transaction([
      this.prisma.guestRequestFile.delete({
        where: { id: file.id }
      }),
      this.prisma.requestStatusHistory.create({
        data: {
          guestRequestId: guestRequest.id,
          oldStatus: guestRequest.status,
          newStatus: guestRequest.status,
          actorType: "ADMIN",
          changedById: adminId,
          comment: `Администратор удалил файл: ${fileLabel}`
        }
      })
    ]);

    return { success: true };
  }

  private parseStatusBody(body: unknown): { status: RequestStatus | null; comment: string | null } {
    const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const rawStatus = input.status;
    const comment = typeof input.comment === "string" ? input.comment.trim().slice(0, 1000) || null : null;

    if (rawStatus === undefined || rawStatus === null || rawStatus === "") {
      return { status: null, comment };
    }

    if (!isRequestStatus(rawStatus)) {
      throw new BadRequestException("Некорректный статус.");
    }

    return { status: rawStatus, comment };
  }

  private async deletePhysicalFile(fileUrl: string) {
    try {
      await deleteUploadedRequestFile(fileUrl);
    } catch (error) {
      if (error instanceof RequestFileValidationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
