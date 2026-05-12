export function normalizeQuantity(value: unknown) {
  const quantity = String(value ?? "").trim();

  if (!quantity) {
    return null;
  }

  if (!/^[1-9]\d*$/.test(quantity)) {
    throw new Error("Количество должно быть положительным числом");
  }

  return quantity;
}
