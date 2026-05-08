import type { RequestStatus } from "@prisma/client";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  NEED_INFO: "Требуется уточнение",
  CALCULATED: "Рассчитана",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена"
};

export const REQUEST_STATUSES: RequestStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "NEED_INFO",
  "CALCULATED",
  "COMPLETED",
  "CANCELLED"
];

export function getRequestStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && REQUEST_STATUSES.includes(value as RequestStatus);
}
