import { useState, type FormEvent } from "react";
import { productRateInputSchema } from "@shared/schemas";
import type { ProductCategory, ProductRateInput, ProductRateRecord, RateUnit } from "@shared/types";
import { Button } from "../ui/Button";
import { Field, inputClassName } from "../ui/Field";

interface ProductRateFormProps {
  initial?: ProductRateRecord;
  onSubmit: (input: ProductRateInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  productName: string;
  category: ProductCategory;
  rateUnit: RateUnit;
  rate: string;
}

const PRODUCT_CATEGORIES: ProductCategory[] = ["Cake", "Brownie", "Cupcake", "Biscuits", "Bento Cake"];
const RATE_UNITS: RateUnit[] = ["kg", "pcs"];

function defaultRateUnitForCategory(category: ProductCategory): RateUnit {
  return category === "Cupcake" ? "pcs" : "kg";
}

function toFormState(product?: ProductRateRecord): FormState {
  return {
    productName: product?.productName ?? "",
    category: product?.category ?? "Cake",
    rateUnit: product?.rateUnit ?? "kg",
    rate: product ? String(product.rate) : "",
  };
}

export function ProductRateForm({ initial, onSubmit, onCancel }: ProductRateFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(category: ProductCategory) {
    setForm((prev) => ({ ...prev, category, rateUnit: defaultRateUnitForCategory(category) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const candidate = {
      productName: form.productName,
      category: form.category,
      rateUnit: form.rateUnit,
      rate: Number(form.rate),
    };

    const parsed = productRateInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save this product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pb-2">
      <Field label="Product name" htmlFor="productName" required error={errors.productName}>
        <input
          id="productName"
          className={inputClassName(!!errors.productName)}
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
          placeholder="e.g. Chocolate Truffle Cake"
        />
      </Field>

      <Field label="Category" htmlFor="category" required>
        <select
          id="category"
          className={inputClassName()}
          value={form.category}
          onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sold by" htmlFor="rateUnit" required hint="Cupcakes are usually sold per piece, not by weight">
        <div className="grid grid-cols-2 gap-2">
          {RATE_UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => update("rateUnit", unit)}
              className={`h-11 rounded-xl border text-sm font-semibold ${
                form.rateUnit === unit
                  ? "border-berry-400 bg-blush-100 text-berry-600"
                  : "border-cream-300 bg-white text-cocoa-500"
              }`}
              aria-pressed={form.rateUnit === unit}
            >
              {unit === "kg" ? "Weight (kg)" : "Piece (pcs)"}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={form.rateUnit === "pcs" ? "Rate per piece (Rs.)" : "Rate per kg (Rs.)"}
        htmlFor="rate"
        required
        error={errors.rate}
        hint="Used to auto-fill the sale amount when this product is chosen"
      >
        <input
          id="rate"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          className={inputClassName(!!errors.rate)}
          value={form.rate}
          onChange={(e) => update("rate", e.target.value)}
          placeholder="0"
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {formError}
        </p>
      )}

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={submitting}>
          Save product
        </Button>
      </div>
    </form>
  );
}
