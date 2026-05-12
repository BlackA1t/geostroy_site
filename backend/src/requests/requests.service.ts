import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RequestStatus } from "@prisma/client";
import { access } from "fs/promises";
import { validateOptionalPhone } from "../common/utils/phone";
import { normalizeQuantity } from "../common/utils/quantity";
import { isRequestServiceType } from "../common/utils/request-options";
import { parseRequestNumberSearch } from "../common/utils/request-number";
import {
  cleanupUploadedRequestFiles,
  deleteUploadedRequestFile,
  persistUploadedRequestFiles,
  RequestFileValidationError,
  resolveUploadedRequestFilePath,
  validateUploadedRequestFiles,
  type UploadedRequestFile
} from "../common/utils/request-files";
import { isRequestStatus } from "../common/utils/request-status";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyRequests(userId: string, filters: { q?: string; status?: string }) {
    const q = String(filters.q ?? "").trim();
    const status = isRequestStatus(filters.status) ? filters.status : null;
    const requestNumberSearch = parseRequestNumberSearch(q);

    const where: Prisma.RequestWhereInput = {
      userId,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
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
      orderBy: {
        createdAt: "desc"
      },
      include: {
        _count: {
          select: {
            files: true
          }
        }
      }
    });

    return { requests };
  }

  async createRequest(userId: string, dto: CreateRequestDto, uploadedFiles: UploadedRequestFile[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    const files = this.getRequestFiles(uploadedFiles);
    const data = this.normalizeRequestData(dto, user.email);

    try {
      validateUploadedRequestFiles(files);

      const createdRequest = await this.prisma.$transaction(async (tx) => {
        const request = await tx.request.create({
          data: {
            userId,
            ...data,
            status: RequestStatus.NEW
          }
        });

        await tx.requestStatusHistory.create({
          data: {
            requestId: request.id,
            oldStatus: null,
            newStatus: RequestStatus.NEW,
            changedById: userId,
            actorType: "USER",
            comment: "Заявка создана пользователем."
          }
        });

        return request;
      });

      await this.attachFiles(createdRequest.id, files);

      return { request: await this.getOwnedRequestOrThrow(userId, createdRequest.id) };
    } catch (error) {
      await cleanupUploadedRequestFiles(files);
      this.throwFileValidationError(error);
      throw error;
    }
  }

  async getMyRequest(userId: string, id: string) {
    return { request: await this.getOwnedRequestOrThrow(userId, id) };
  }

  async updateRequest(userId: string, id: string, dto: UpdateRequestDto, uploadedFiles: UploadedRequestFile[]) {
    const existingRequest = await this.prisma.request.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingRequest) {
      throw new NotFoundException("Заявка не найдена.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    const files = this.getRequestFiles(uploadedFiles);
    const data = this.normalizeRequestData(dto, user.email);
    const nextStatus = RequestStatus.NEW;
    const statusWasReset = existingRequest.status !== nextStatus;
    const historyComment = statusWasReset
      ? "Пользователь изменил данные заявки. Статус автоматически сброшен на «Новая»."
      : "Пользователь изменил данные заявки.";

    try {
      validateUploadedRequestFiles(files);

      const updatedRequest = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.request.update({
          where: {
            id: existingRequest.id
          },
          data: {
            ...data,
            status: nextStatus
          }
        });

        await tx.requestStatusHistory.create({
          data: {
            requestId: existingRequest.id,
            oldStatus: existingRequest.status,
            newStatus: nextStatus,
            changedById: userId,
            actorType: statusWasReset ? "SYSTEM" : "USER",
            comment: historyComment
          }
        });

        return updated;
      });

      await this.attachFiles(updatedRequest.id, files);

      return { request: await this.getOwnedRequestOrThrow(userId, updatedRequest.id) };
    } catch (error) {
      await cleanupUploadedRequestFiles(files);
      this.throwFileValidationError(error);
      throw error;
    }
  }

  async deleteRequestFile(userId: string, id: string, fileId: string) {
    const request = await this.prisma.request.findFirst({
      where: {
        id,
        userId
      },
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

    try {
      await deleteUploadedRequestFile(file.fileUrl);
    } catch (error) {
      this.throwFileValidationError(error);
      throw error;
    }

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
          actorType: "USER",
          changedById: userId,
          comment: `Пользователь удалил файл: ${fileLabel}`
        }
      })
    ]);

    return { success: true };
  }

  async getRequestFileForDownload(userId: string, id: string, fileId: string) {
    const request = await this.prisma.request.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true
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
        fileUrl: true,
        fileName: true,
        fileType: true,
        originalName: true
      }
    });

    if (!file) {
      throw new NotFoundException("Файл не найден.");
    }

    return this.getDownloadableFile(file);
  }

  private async getOwnedRequestOrThrow(userId: string, id: string) {
    const request = await this.prisma.request.findFirst({
      where: {
        id,
        userId
      },
      include: {
        files: {
          orderBy: {
            createdAt: "desc"
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

    return request;
  }

  private normalizeRequestData(dto: CreateRequestDto | UpdateRequestDto, fallbackEmail: string) {
    const serviceType = this.normalizeRequiredString(dto.serviceType);
    const description = this.normalizeRequiredString(dto.description);
    const name = this.normalizeRequiredString(dto.name);
    const phone = this.normalizeRequiredString(dto.phone);
    const material = this.normalizeOptionalString(dto.material);
    const email = this.normalizeOptionalString(dto.email)?.toLowerCase() ?? fallbackEmail;
    let quantity: string | null;

    if (!serviceType || !description || !name || !phone) {
      throw new BadRequestException("Заполните тип услуги, описание задачи, имя и телефон.");
    }

    if (!isRequestServiceType(serviceType)) {
      throw new BadRequestException("Выберите тип услуги из списка");
    }

    const phoneError = validateOptionalPhone(phone);
    if (phoneError) {
      throw new BadRequestException(phoneError);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("Неправильный формат email");
    }

    try {
      quantity = normalizeQuantity(dto.quantity);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : "Некорректное количество.");
    }

    return {
      serviceType,
      material,
      quantity,
      description,
      name,
      phone,
      email
    };
  }

  private normalizeRequiredString(value: unknown) {
    return String(value ?? "").trim();
  }

  private normalizeOptionalString(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  }

  private getRequestFiles(uploadedFiles: UploadedRequestFile[]) {
    const unexpectedFile = uploadedFiles.find((file) => file.fieldname !== "files");

    if (unexpectedFile) {
      throw new BadRequestException("Некорректное поле файла.");
    }

    return uploadedFiles.filter((file) => file.size > 0 && Boolean(file.originalname));
  }

  private async attachFiles(requestId: string, files: UploadedRequestFile[]) {
    if (files.length === 0) {
      return;
    }

    const savedFiles = await persistUploadedRequestFiles(requestId, files);

    await this.prisma.requestFile.createMany({
      data: savedFiles.map((file) => ({
        requestId,
        ...file
      }))
    });
  }

  private throwFileValidationError(error: unknown): never | void {
    if (error instanceof RequestFileValidationError) {
      throw new BadRequestException(error.message);
    }
  }

  private async getDownloadableFile(file: { fileUrl: string; fileName: string; fileType: string | null; originalName: string | null }) {
    try {
      const absolutePath = resolveUploadedRequestFilePath(file.fileUrl);
      await access(absolutePath);

      return {
        absolutePath,
        fileName: file.fileName,
        fileType: file.fileType,
        originalName: file.originalName
      };
    } catch (error) {
      this.throwFileValidationError(error);
      throw new NotFoundException("Файл не найден.");
    }
  }
}
