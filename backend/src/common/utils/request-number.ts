export function formatRequestNumber(requestNumber?: number | null) {
  if (!requestNumber) {
    return "№------";
  }

  return `№${String(requestNumber).padStart(6, "0")}`;
}

export function formatRequestTitle(requestNumber?: number | null) {
  return `Заявка ${formatRequestNumber(requestNumber)}`;
}

export function parseRequestNumberSearch(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
