export const INVALID_PHONE_MESSAGE = "Неправильный формат телефона";

export function normalizePhoneInput(phone: string) {
  return phone.trim().replace(/[\s()-]/g, "");
}

export function isValidPhone(phone: string) {
  const trimmed = phone.trim();

  if (!trimmed) return false;
  if (!/^[+\d\s()-]+$/.test(trimmed)) return false;
  if ((trimmed.match(/\+/g) ?? []).length > 1) return false;
  if (trimmed.includes("+") && !trimmed.startsWith("+")) return false;

  const normalized = normalizePhoneInput(trimmed);
  return /^(\+7|7|8)\d{10}$/.test(normalized);
}

export function validatePhone(phone: string) {
  if (!phone.trim()) {
    return "Укажите телефон";
  }

  return isValidPhone(phone) ? null : INVALID_PHONE_MESSAGE;
}

export function validateOptionalPhone(phone: string | null | undefined) {
  const normalized = String(phone ?? "").trim();
  return normalized ? validatePhone(normalized) : null;
}
