import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RequestStatus } from "@prisma/client";
import { validateOptionalPhone } from "../common/utils/phone";
import { normalizeQuantity } from "../common/utils/quantity";
import { generateGuestRequestToken, hashGuestRequestToken } from "../common/utils/guest-claim-token";
import { isRequestServiceType } from "../common/utils/request-options";
import {
  cleanupUploadedRequestFiles,
  persistUploadedRequestFiles,
  RequestFileValidationError,
  validateUploadedRequestFiles,
  type UploadedRequestFile
} from "../common/utils/request-files";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGuestRequestDto } from "./dto/create-guest-request.dto";

@Injectable()
export class GuestRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestRequest(dto: CreateGuestRequestDto, uploadedFiles: UploadedRequestFile[]) {
    const files = this.getRequestFiles(uploadedFiles);
    const data = this.normalizeGuestRequestData(dto);
    const claimToken = generateGuestRequestToken();

    try {
      validateUploadedRequestFiles(files);

      const guestRequest = await this.prisma.$transaction(async (tx) => {
        const created = await tx.guestRequest.create({
          data: {
            ...data,
            status: RequestStatus.NEW,
            claimTokenHash: hashGuestRequestToken(claimToken)
          }
        });

        await tx.requestStatusHistory.create({
          data: {
            guestRequestId: created.id,
            oldStatus: null,
            newStatus: RequestStatus.NEW,
            changedById: null,
            actorType: "SYSTEM",
            comment: "Гостевая заявка создана через форму контактов."
          }
        });

        return created;
      });

      await this.attachGuestFiles(guestRequest.id, files);

      return {
        claimToken,
        response: {
          type: "guest",
          guestRequestId: guestRequest.id,
          message: "Заявка отправлена. Войдите или зарегистрируйтесь, чтобы отслеживать статус заявки."
        }
      };
    } catch (error) {
      await cleanupUploadedRequestFiles(files);
      this.throwFileValidationError(error);
      throw error;
    }
  }

  async getPendingGuestRequest(token?: string | null) {
    if (!token) {
      return { guestRequest: null };
    }

    const guestRequest = await this.prisma.guestRequest.findFirst({
      where: {
        claimTokenHash: hashGuestRequestToken(token),
        claimedAt: null
      },
      select: {
        id: true,
        guestRequestNumber: true,
        createdAt: true,
        serviceType: true,
        status: true
      }
    });

    return { guestRequest };
  }

  async claimGuestRequest(userId: string, token?: string | null) {
    if (!token) {
      return { request: null };
    }

    const claimTokenHash = hashGuestRequestToken(token);
    const guestRequest = await this.prisma.guestRequest.findFirst({
      where: {
        claimTokenHash
      },
      include: {
        files: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!guestRequest) {
      throw new NotFoundException("Гостевая заявка для привязки не найдена.");
    }

    if (guestRequest.claimedAt) {
      if (guestRequest.claimedById === userId && guestRequest.convertedRequestId) {
        const request = await this.prisma.request.findFirst({
          where: {
            id: guestRequest.convertedRequestId,
            userId
          }
        });

        return { request };
      }

      throw new ConflictException("Гостевая заявка уже привязана к пользователю.");
    }

    const createdRequest = await this.prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          userId,
          name: guestRequest.name,
          phone: guestRequest.phone,
          email: guestRequest.email,
          serviceType: guestRequest.serviceType,
          material: guestRequest.material,
          quantity: guestRequest.quantity,
          description: guestRequest.description,
          status: guestRequest.status,
          files: {
            create: guestRequest.files.map((file) => ({
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileType: file.fileType,
              originalName: file.originalName,
              sizeBytes: file.sizeBytes
            }))
          }
        }
      });

      await tx.guestRequest.update({
        where: {
          id: guestRequest.id
        },
        data: {
          claimedById: userId,
          convertedRequestId: request.id,
          claimedAt: new Date()
        }
      });

      for (const historyItem of guestRequest.statusHistory) {
        await tx.requestStatusHistory.create({
          data: {
            requestId: request.id,
            oldStatus: historyItem.oldStatus,
            newStatus: historyItem.newStatus,
            comment: historyItem.comment,
            changedById: historyItem.changedById,
            actorType: historyItem.actorType,
            createdAt: historyItem.createdAt
          }
        });
      }

      await tx.requestStatusHistory.createMany({
        data: [
          {
            guestRequestId: guestRequest.id,
            oldStatus: guestRequest.status,
            newStatus: guestRequest.status,
            actorType: "SYSTEM",
            changedById: userId,
            comment: "Гостевая заявка привязана к пользователю."
          },
          {
            requestId: request.id,
            oldStatus: request.status,
            newStatus: request.status,
            actorType: "SYSTEM",
            changedById: userId,
            comment: "Заявка создана из гостевой заявки."
          }
        ]
      });

      await tx.notification.create({
        data: {
          userId,
          requestId: request.id,
          title: "Гостевая заявка привязана к аккаунту",
          message: "Заявка, отправленная через форму контактов, теперь доступна в личном кабинете.",
          type: "SYSTEM"
        }
      });

      return request;
    });

    return { request: createdRequest };
  }

  private normalizeGuestRequestData(dto: CreateGuestRequestDto) {
    const serviceType = this.normalizeRequiredString(dto.serviceType);
    const description = this.normalizeRequiredString(dto.description);
    const name = this.normalizeRequiredString(dto.name);
    const phone = this.normalizeRequiredString(dto.phone);
    const material = this.normalizeOptionalString(dto.material);
    const email = this.normalizeOptionalString(dto.email)?.toLowerCase() ?? null;
    let quantity: string | null;

    if (!serviceType || !description || !name || !phone) {
      throw new BadRequestException("Заполните имя, телефон, тип услуги и описание задачи.");
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

  private async attachGuestFiles(guestRequestId: string, files: UploadedRequestFile[]) {
    if (files.length === 0) {
      return;
    }

    const savedFiles = await persistUploadedRequestFiles(`guest-${guestRequestId}`, files);

    await this.prisma.guestRequestFile.createMany({
      data: savedFiles.map((file) => ({
        guestRequestId,
        ...file
      }))
    });
  }

  private throwFileValidationError(error: unknown): never | void {
    if (error instanceof RequestFileValidationError) {
      throw new BadRequestException(error.message);
    }
  }
}
