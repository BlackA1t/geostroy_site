export function formatRequestNumber(requestNumber?: number | null) {
  if (!requestNumber) {
    return "№------";
  }

  return `№${String(requestNumber).padStart(6, "0")}`;
}

export function formatRequestTitle(requestNumber?: number | null) {
  return `Заявка ${formatRequestNumber(requestNumber)}`;
}

export function formatGuestRequestNumber(guestRequestNumber?: number | null) {
  return formatRequestNumber(guestRequestNumber);
}

export function formatGuestRequestTitle(guestRequestNumber?: number | null) {
  return `Гостевая заявка ${formatGuestRequestNumber(guestRequestNumber)}`;
}

export function formatCallbackRequestNumber(callbackRequestNumber?: number | null) {
  return formatRequestNumber(callbackRequestNumber);
}

export function formatCallbackRequestTitle(callbackRequestNumber?: number | null) {
  return `Обратный звонок ${formatCallbackRequestNumber(callbackRequestNumber)}`;
}

export function parseRequestNumberSearch(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
