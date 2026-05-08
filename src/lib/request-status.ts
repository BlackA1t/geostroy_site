import type { RequestStatus } from "@prisma/client";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  NEED_INFO: "Требуется уточнение",
  CALCULATED: "Рассчитана",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена"
};

export function getRequestStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}
