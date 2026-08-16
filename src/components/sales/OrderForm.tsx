import { useMemo, useState, type FormEvent } from "react";
import { ChevronDown, Gift, Contact } from "lucide-react";
import { orderInputSchema } from "@shared/schemas";
import type { CustomerSummary, Occasion, OrderInput, OrderRecord, ProductCategory, QuantityUnit } from "@shared/types";
import { Button } from "../ui/Button";
import { Field, inputClassName } from "../ui/Field";
import { todayDateOnly } from "../../lib/dateRange";
import { useData } from "../../context/DataContext";
import { aggregateCustomers } from "../../lib/customers";
import { CustomerPickerSheet } from "./CustomerPickerSheet";

interface OrderFormProps {
  initial?: OrderRecord;
  onSubmit: (input: OrderInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  customerName: string;
  phoneNumber: string;
  productCategory: ProductCategory;
  productName: string;
  quantity: string;
  quantityUnit: QuantityUnit;
  totalAmount: string;
  saleDate: string;
  pickupOrDeliveryTime: string;
  occasion: Occasion;
  occasionDate: string;
  occasionNote: string;
  reminderEnabled: boolean;
}

const PRODUCT_CATEGORIES: ProductCategory[] = ["Cake", "Brownie", "Cupcake", "Biscuits", "Bento Cake"];

function defaultUnitForCategory(category: ProductCategory): QuantityUnit {
  return category === "Cake" || category === "Bento Cake" ? "kg" : "g";
}

function toFormState(order?: OrderRecord): FormState {
  return {
    customerName: order?.customerName ?? "",
    phoneNumber: order?.phoneNumber ?? "",
    productCategory: order?.productCategory ?? "Cake",
    productName: order?.productName ?? "",
    quantity: order ? String(order.quantity) : "1",
    quantityUnit: order?.quantityUnit ?? "kg",
    totalAmount: order ? String(order.totalAmount) : "",
    saleDate: order?.saleDate ?? todayDateOnly(),
    pickupOrDeliveryTime: order?.pickupOrDeliveryTime ?? "",
    occasion: order?.occasion ?? "None",
    occasionDate: order?.occasionDate ?? "",
    occasionNote: order?.occasionNote ?? "",
    reminderEnabled: order?.reminderEnabled ?? false,
  };
}

export function OrderForm({ initial, onSubmit, onCancel }: OrderFormProps) {
  const { orders } = useData();
  const customers = useMemo(() => aggregateCustomers(orders), [orders]);

  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showOccasion, setShowOccasion] = useState(() => (initial?.occasion ?? "None") !== "None");
  const [pickerOpen, setPickerOpen] = useState(false);

  const needsOccasionDate = form.occasion === "Birthday" || form.occasion === "Anniversary";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(category: ProductCategory) {
    setForm((prev) => ({ ...prev, productCategory: category, quantityUnit: defaultUnitForCategory(category) }));
  }

  function handleOccasionChange(occasion: Occasion) {
    setForm((prev) => ({
      ...prev,
      occasion,
      occasionDate:
        (occasion === "Birthday" || occasion === "Anniversary") && !prev.occasionDate
          ? todayDateOnly()
          : prev.occasionDate,
    }));
  }

  function handlePickCustomer(customer: CustomerSummary) {
    setForm((prev) => ({ ...prev, customerName: customer.name, phoneNumber: customer.phoneNumber }));
    setPickerOpen(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const candidate = {
      customerName: form.customerName,
      phoneNumber: form.phoneNumber,
      productCategory: form.productCategory,
      productName: form.productName,
      quantity: Number(form.quantity),
      quantityUnit: form.quantityUnit,
      totalAmount: Number(form.totalAmount),
      saleDate: form.saleDate,
      pickupOrDeliveryTime: form.pickupOrDeliveryTime,
      occasion: form.occasion,
      occasionDate: needsOccasionDate ? form.occasionDate || null : null,
      occasionNote: form.occasion !== "None" ? form.occasionNote : "",
      reminderEnabled: needsOccasionDate ? form.reminderEnabled : false,
    };

    const parsed = orderInputSchema.safeParse(candidate);
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
      setFormError(err instanceof Error ? err.message : "Could not save this sale. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pb-2">
      <Field label="Customer name" htmlFor="customerName" required error={errors.customerName}>
        <div className="flex gap-2">
          <input
            id="customerName"
            className={inputClassName(!!errors.customerName)}
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            placeholder="e.g. Priya Kumar"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label="Choose an existing customer"
            title="Choose an existing customer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-300 bg-white text-cocoa-500"
          >
            <Contact className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </Field>

      <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber}>
        <input
          id="phoneNumber"
          type="tel"
          inputMode="tel"
          className={inputClassName(!!errors.phoneNumber)}
          value={form.phoneNumber}
          onChange={(e) => update("phoneNumber", e.target.value)}
          placeholder="e.g. 98765 43210"
        />
      </Field>

      <Field label="Category" htmlFor="productCategory" required>
        <select
          id="productCategory"
          className={inputClassName()}
          value={form.productCategory}
          onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Product / description" htmlFor="productName" required error={errors.productName}>
        <input
          id="productName"
          className={inputClassName(!!errors.productName)}
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
          placeholder="e.g. Chocolate Truffle Cake"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity" htmlFor="quantity" required error={errors.quantity}>
          <input
            id="quantity"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            className={inputClassName(!!errors.quantity)}
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </Field>
        <Field label="Unit" htmlFor="quantityUnit" required>
          <select
            id="quantityUnit"
            className={inputClassName()}
            value={form.quantityUnit}
            onChange={(e) => update("quantityUnit", e.target.value as QuantityUnit)}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
          </select>
        </Field>
      </div>

      <Field label="Total amount (Rs.)" htmlFor="totalAmount" required error={errors.totalAmount}>
        <input
          id="totalAmount"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          className={inputClassName(!!errors.totalAmount)}
          value={form.totalAmount}
          onChange={(e) => update("totalAmount", e.target.value)}
          placeholder="0"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sale date" htmlFor="saleDate" required error={errors.saleDate}>
          <input
            id="saleDate"
            type="date"
            className={inputClassName(!!errors.saleDate)}
            value={form.saleDate}
            onChange={(e) => update("saleDate", e.target.value)}
          />
        </Field>
        <Field label="Pickup / delivery time" htmlFor="pickupOrDeliveryTime">
          <input
            id="pickupOrDeliveryTime"
            className={inputClassName()}
            value={form.pickupOrDeliveryTime}
            onChange={(e) => update("pickupOrDeliveryTime", e.target.value)}
            placeholder="e.g. 6:00 PM"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-cream-300 bg-white">
        <button
          type="button"
          onClick={() => setShowOccasion((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left"
          aria-expanded={showOccasion}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-cocoa-600">
            <Gift className="h-4 w-4 text-berry-500" aria-hidden />
            Birthday / anniversary reminder
            <span className="font-normal text-cocoa-400">(optional)</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-cocoa-400 transition-transform ${showOccasion ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {showOccasion && (
          <div className="flex flex-col gap-4 border-t border-cream-200 px-3.5 py-4">
            <Field label="Occasion" htmlFor="occasion">
              <select
                id="occasion"
                className={inputClassName()}
                value={form.occasion}
                onChange={(e) => handleOccasionChange(e.target.value as Occasion)}
              >
                <option value="None">None</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            {needsOccasionDate && (
              <>
                <Field label="Occasion date" htmlFor="occasionDate" required error={errors.occasionDate}>
                  <input
                    id="occasionDate"
                    type="date"
                    className={inputClassName(!!errors.occasionDate)}
                    value={form.occasionDate}
                    onChange={(e) => update("occasionDate", e.target.value)}
                  />
                </Field>
                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-cream-300 bg-white px-3.5 py-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-berry-500"
                    checked={form.reminderEnabled}
                    onChange={(e) => update("reminderEnabled", e.target.checked)}
                  />
                  <span className="text-sm text-cocoa-600">Remind me before this occasion each year</span>
                </label>
              </>
            )}

            {form.occasion !== "None" && (
              <Field label="Note" htmlFor="occasionNote" hint="Anything you want to remember about this occasion">
                <textarea
                  id="occasionNote"
                  rows={2}
                  maxLength={300}
                  className={`${inputClassName()} h-auto py-2`}
                  value={form.occasionNote}
                  onChange={(e) => update("occasionNote", e.target.value)}
                  placeholder="e.g. Likes eggless cakes"
                />
              </Field>
            )}
          </div>
        )}
      </div>

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
          Save sale
        </Button>
      </div>

      <CustomerPickerSheet
        open={pickerOpen}
        customers={customers}
        onSelect={handlePickCustomer}
        onClose={() => setPickerOpen(false)}
      />
    </form>
  );
}
