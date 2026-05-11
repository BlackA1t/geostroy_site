export const PHONE_FORMAT_ERROR = "Неправильный формат телефона";

export function normalizePhoneInput(phone: string): string {
  return phone.trim();
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhoneInput(phone);

  if (!normalized) return false;
  if (/[A-Za-zА-Яа-яЁё]/.test(normalized)) return false;

  const compact = normalized.replace(/[\s()-]/g, "");

  return /^(\+7|7|8)\d{10}$/.test(compact);
}

export function validateOptionalPhone(phone?: string | null): string | null {
  const normalized = normalizePhoneInput(phone ?? "");

  if (!normalized) return null;

  return isValidPhone(normalized) ? null : PHONE_FORMAT_ERROR;
}
