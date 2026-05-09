import type { CallbackStatus } from "@prisma/client";

export const CALLBACK_STATUSES: CallbackStatus[] = ["NEW", "CONTACTED", "CANCELLED"];

export const CALLBACK_STATUS_LABELS: Record<CallbackStatus, string> = {
  NEW: "Новая",
  CONTACTED: "Связались",
  CANCELLED: "Отменена"
};

export function getCallbackStatusLabel(status: CallbackStatus) {
  return CALLBACK_STATUS_LABELS[status];
}

export function isCallbackStatus(value: unknown): value is CallbackStatus {
  return typeof value === "string" && CALLBACK_STATUSES.includes(value as CallbackStatus);
}
