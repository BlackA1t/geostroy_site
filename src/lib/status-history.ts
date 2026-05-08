import type { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestStatusLabel } from "@/lib/request-status";

export type StatusHistoryActorType = "ADMIN" | "USER" | "SYSTEM";

type StatusHistoryBaseInput = {
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  comment?: string | null;
  changedById?: string | null;
  actorType: StatusHistoryActorType;
  createdAt?: Date;
};

type PrismaTransaction = Prisma.TransactionClient;

function normalizeComment(comment?: string | null) {
  const normalized = comment?.trim();
  return normalized || null;
}

export async function createRequestStatusHistory(
  input: StatusHistoryBaseInput & { requestId: string },
  client: typeof prisma | PrismaTransaction = prisma
) {
  if (input.oldStatus === input.newStatus) return null;

  return client.requestStatusHistory.create({
    data: {
      requestId: input.requestId,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      comment: normalizeComment(input.comment),
      changedById: input.changedById ?? null,
      actorType: input.actorType,
      ...(input.createdAt ? { createdAt: input.createdAt } : {})
    }
  });
}

export async function createGuestRequestStatusHistory(
  input: StatusHistoryBaseInput & { guestRequestId: string },
  client: typeof prisma | PrismaTransaction = prisma
) {
  if (input.oldStatus === input.newStatus) return null;

  return client.requestStatusHistory.create({
    data: {
      guestRequestId: input.guestRequestId,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      comment: normalizeComment(input.comment),
      changedById: input.changedById ?? null,
      actorType: input.actorType,
      ...(input.createdAt ? { createdAt: input.createdAt } : {})
    }
  });
}

export function getStatusHistoryLabel(oldStatus: RequestStatus | null, newStatus: RequestStatus) {
  const oldLabel = oldStatus ? getRequestStatusLabel(oldStatus) : "Создана";
  return `${oldLabel} -> ${getRequestStatusLabel(newStatus)}`;
}
