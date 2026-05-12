export type RequestStatus = "NEW" | "NEED_INFO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  NEED_INFO: "Требуется уточнение",
  COMPLETED: "Выполнена",
  CANCELLED: "Отменена"
};

export const REQUEST_STATUSES: RequestStatus[] = [
  "NEW",
  "NEED_INFO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

export function getRequestStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}

export function getRequestStatusClassName(status: RequestStatus) {
  return `status-${status.toLowerCase()}`;
}

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && REQUEST_STATUSES.includes(value as RequestStatus);
}
