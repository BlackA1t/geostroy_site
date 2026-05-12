export const REQUEST_SERVICE_TYPES = [
  "Токарная обработка",
  "Фрезерная обработка",
  "Изготовление деталей по чертежам",
  "Металлообработка на заказ",
  "Сверление и нарезание резьбы",
  "Мелкосерийное изготовление",
  "Расчёт стоимости"
] as const;

export const REQUEST_MATERIAL_SUGGESTIONS = [
  "Сталь",
  "Нержавеющая сталь",
  "Алюминий",
  "Латунь",
  "Бронза",
  "Медь",
  "Титан",
  "Пластик",
  "Другое"
] as const;

export type RequestServiceType = (typeof REQUEST_SERVICE_TYPES)[number];

export function isRequestServiceType(value: unknown): value is RequestServiceType {
  return typeof value === "string" && (REQUEST_SERVICE_TYPES as readonly string[]).includes(value);
}
