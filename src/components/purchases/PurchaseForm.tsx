import { useState, type FormEvent } from "react";
import { purchaseInputSchema } from "@shared/schemas";
import type { PurchaseCategory, PurchaseInput, PurchaseRecord } from "@shared/types";
import { Button } from "../ui/Button";
import { Field, inputClassName } from "../ui/Field";
import { todayDateOnly } from "../../lib/dateRange";

interface PurchaseFormProps {
  initial?: PurchaseRecord;
  onSubmit: (input: PurchaseInput) => Promise<void>;
  onCancel: () => void;
}

const PURCHASE_CATEGORIES: PurchaseCategory[] = ["Baking Essentials", "General Groceries"];

export function PurchaseForm({ initial, onSubmit, onCancel }: PurchaseFormProps) {
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchaseDate ?? todayDateOnly());
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : "");
  const [category, setCategory] = useState<PurchaseCategory>(initial?.category ?? "Baking Essentials");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const parsed = purchaseInputSchema.safeParse({
      purchaseDate,
      totalAmount: Number(totalAmount),
      category,
    });

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
      setFormError(err instanceof Error ? err.message : "Could not save this purchase. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Date" htmlFor="purchaseDate" required error={errors.purchaseDate}>
        <input
          id="purchaseDate"
          type="date"
          className={inputClassName(!!errors.purchaseDate)}
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
      </Field>

      <Field label="Amount (Rs.)" htmlFor="totalAmount" required error={errors.totalAmount}>
        <input
          id="totalAmount"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          autoFocus
          className={inputClassName(!!errors.totalAmount)}
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Category" htmlFor="category" required error={errors.category}>
        <div className="grid grid-cols-2 gap-2">
          {PURCHASE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`h-11 rounded-xl border text-sm font-semibold ${
                category === c
                  ? "border-berry-400 bg-blush-100 text-berry-600"
                  : "border-cream-300 bg-white text-cocoa-500"
              }`}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
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
          Save
        </Button>
      </div>
    </form>
  );
}
