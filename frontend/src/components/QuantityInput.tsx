"use client";

type QuantityInputProps = {
  defaultValue?: string | null;
  id: string;
  label: string;
  name: string;
  placeholder?: string;
};

function normalizeQuantityValue(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  const numberValue = Number(digitsOnly);
  return Number.isFinite(numberValue) && numberValue > 0 ? String(numberValue) : "";
}

export function QuantityInput({ defaultValue, id, label, name, placeholder }: QuantityInputProps) {
  const initialValue = defaultValue && /^\d+$/.test(defaultValue) && Number(defaultValue) > 0 ? defaultValue : "";

  function handleStep(delta: number) {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;

    const currentValue = input.value ? Number(input.value) : 0;
    const nextValue = Math.max(1, currentValue + delta);
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="quantity-control">
        <button
          aria-label="Уменьшить количество"
          className="quantity-step"
          type="button"
          onClick={() => handleStep(-1)}
        >
          -
        </button>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          defaultValue={initialValue}
          placeholder={placeholder}
          onInput={(event) => {
            const input = event.currentTarget;
            const normalized = normalizeQuantityValue(input.value);

            if (input.value !== normalized) {
              input.value = normalized;
            }
          }}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
              event.preventDefault();
            }
          }}
        />
        <button
          aria-label="Увеличить количество"
          className="quantity-step"
          type="button"
          onClick={() => handleStep(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
