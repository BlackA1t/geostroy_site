import { RequestStatus } from "@prisma/client";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  NEED_INFO: "Требуется уточнение",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена"
};

export const REQUEST_STATUSES: RequestStatus[] = [
  RequestStatus.NEW,
  RequestStatus.NEED_INFO,
  RequestStatus.IN_PROGRESS,
  RequestStatus.COMPLETED,
  RequestStatus.CANCELLED
];

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && REQUEST_STATUSES.includes(value as RequestStatus);
}

export function getRequestStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}
