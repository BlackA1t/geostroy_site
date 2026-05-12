import { BadRequestException } from "@nestjs/common";
import { validateOptionalPhone } from "./phone";
import { normalizeQuantity } from "./quantity";
import { isRequestServiceType } from "./request-options";

export type AdminRequestDetailsInput = {
  serviceType: string;
  material: string | null;
  quantity: string | null;
  description: string;
  name: string;
  phone: string;
  email: string | null;
};

type EditableRequestDetails = AdminRequestDetailsInput;

const FIELD_LABELS: Record<keyof AdminRequestDetailsInput, string> = {
  serviceType: "Тип услуги",
  material: "Материал",
  quantity: "Количество",
  description: "Описание",
  name: "Имя",
  phone: "Телефон",
  email: "Email"
};

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatHistoryValue(value: string | null) {
  return value || "не указано";
}

export function parseAdminRequestDetailsInput(body: unknown): AdminRequestDetailsInput {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const serviceType = String(input.serviceType ?? "").trim();
  const description = String(input.description ?? "").trim();
  const name = String(input.name ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const email = normalizeOptionalString(input.email)?.toLowerCase() ?? null;
  const material = normalizeOptionalString(input.material);
  let quantity: string | null;

  if (!serviceType || !description || !name || !phone) {
    throw new BadRequestException("Заполните тип услуги, описание, имя и телефон.");
  }

  if (!isRequestServiceType(serviceType)) {
    throw new BadRequestException("Выберите тип услуги из списка");
  }

  const phoneError = validateOptionalPhone(phone);
  if (phoneError) {
    throw new BadRequestException(phoneError);
  }

  if (email && !isEmail(email)) {
    throw new BadRequestException("Неправильный формат email");
  }

  try {
    quantity = normalizeQuantity(input.quantity);
  } catch (error) {
    throw new BadRequestException(error instanceof Error ? error.message : "Некорректное количество.");
  }

  return {
    serviceType,
    material,
    quantity,
    description,
    name,
    phone,
    email
  };
}

export function getAdminRequestDetailsChanges(current: EditableRequestDetails, next: AdminRequestDetailsInput) {
  return (Object.keys(FIELD_LABELS) as Array<keyof AdminRequestDetailsInput>)
    .filter((field) => (current[field] ?? null) !== (next[field] ?? null))
    .map((field) => ({
      field,
      label: FIELD_LABELS[field],
      oldValue: current[field] ?? null,
      newValue: next[field] ?? null
    }));
}

export function buildAdminRequestEditComment(changes: ReturnType<typeof getAdminRequestDetailsChanges>) {
  const lines = changes.map(
    (change) =>
      `- ${change.label}: было "${formatHistoryValue(change.oldValue)}", стало "${formatHistoryValue(change.newValue)}"`
  );

  return ["Администратор изменил данные заявки:", ...lines].join("\n");
}
