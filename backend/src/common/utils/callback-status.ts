import { CallbackStatus } from "@prisma/client";

export const CALLBACK_STATUSES: CallbackStatus[] = [
  CallbackStatus.NEW,
  CallbackStatus.CONTACTED,
  CallbackStatus.CANCELLED
];

export function isCallbackStatus(value: unknown): value is CallbackStatus {
  return typeof value === "string" && CALLBACK_STATUSES.includes(value as CallbackStatus);
}
