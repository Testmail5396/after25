import { useMemo, useState, type FormEvent } from "react";
import { ChevronDown, Gift, Contact, Tag } from "lucide-react";
import { orderInputSchema } from "@shared/schemas";
import type {
  CustomerSummary,
  Occasion,
  OrderInput,
  OrderRecord,
  PaymentStatus,
  ProductCategory,
  ProductRateRecord,
  QuantityUnit,
  RateUnit,
} from "@shared/types";
import { Button } from "../ui/Button";
import { Field, inputClassName } from "../ui/Field";
import { todayDateOnly } from "../../lib/dateRange";
import { useData } from "../../context/DataContext";
import { aggregateCustomers } from "../../lib/customers";
import {
  calculateAmountFromRate,
  defaultUnitForRate,
  findRateForProduct,
  isUnitCompatibleWithRate,
} from "../../lib/productRates";
import { formatCurrency } from "../../lib/format";
import { CustomerPickerSheet } from "./CustomerPickerSheet";
import { ProductRatePickerSheet } from "./ProductRatePickerSheet";

interface OrderFormProps {
  initial?: OrderRecord;
  /** Pre-fills and locks the customer name/phone fields — used when adding a sale from a specific customer's detail view. */
  lockedCustomer?: { name: string; phoneNumber: string };
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
  paymentStatus: PaymentStatus;
}

const PRODUCT_CATEGORIES: ProductCategory[] = ["Cake", "Brownie", "Cupcake", "Biscuits", "Bento Cake"];
const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Partial", "Pending"];

function defaultUnitForCategory(category: ProductCategory): QuantityUnit {
  if (category === "Cake" || category === "Bento Cake") return "kg";
  if (category === "Cupcake") return "pcs";
  return "g";
}

function toFormState(order?: OrderRecord, lockedCustomer?: { name: string; phoneNumber: string }): FormState {
  return {
    customerName: order?.customerName ?? lockedCustomer?.name ?? "",
    phoneNumber: order?.phoneNumber ?? lockedCustomer?.phoneNumber ?? "",
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
    paymentStatus: order?.paymentStatus ?? "Paid",
  };
}

export function OrderForm({ initial, lockedCustomer, onSubmit, onCancel }: OrderFormProps) {
  const { orders, productRates } = useData();
  const customers = useMemo(() => aggregateCustomers(orders), [orders]);

  const [form, setForm] = useState<FormState>(() => toFormState(initial, lockedCustomer));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showOccasion, setShowOccasion] = useState(() => (initial?.occasion ?? "None") !== "None");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<{ amount: number; unit: RateUnit } | null>(null);

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

  function recalcAmount(quantity: string, unit: QuantityUnit, rate: { amount: number; unit: RateUnit } | null) {
    if (rate === null) return;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    update("totalAmount", String(calculateAmountFromRate(rate.amount, rate.unit, qty, unit)));
  }

  function applyRate(rate: { amount: number; unit: RateUnit } | null) {
    setSelectedRate(rate);
    if (!rate) return;
    const compatibleUnit = isUnitCompatibleWithRate(form.quantityUnit, rate.unit)
      ? form.quantityUnit
      : defaultUnitForRate(rate.unit);
    if (compatibleUnit !== form.quantityUnit) update("quantityUnit", compatibleUnit);
    recalcAmount(form.quantity, compatibleUnit, rate);
  }

  function handleProductNameChange(value: string) {
    update("productName", value);
    const match = findRateForProduct(productRates, value);
    applyRate(match ? { amount: match.rate, unit: match.rateUnit } : null);
  }

  function handleQuantityChange(value: string) {
    update("quantity", value);
    recalcAmount(value, form.quantityUnit, selectedRate);
  }

  function handleUnitChange(unit: QuantityUnit) {
    update("quantityUnit", unit);
    recalcAmount(form.quantity, unit, selectedRate);
  }

  function handlePickProduct(product: ProductRateRecord) {
    setForm((prev) => ({ ...prev, productName: product.productName, productCategory: product.category }));
    applyRate({ amount: product.rate, unit: product.rateUnit });
    setProductPickerOpen(false);
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
      paymentStatus: form.paymentStatus,
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
            className={`${inputClassName(!!errors.customerName)} ${lockedCustomer ? "bg-cream-100 text-cocoa-500" : ""}`}
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            placeholder="e.g. Priya Kumar"
            disabled={!!lockedCustomer}
          />
          {!lockedCustomer && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Choose an existing customer"
              title="Choose an existing customer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-300 bg-white text-cocoa-500"
            >
              <Contact className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
      </Field>

      <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber}>
        <input
          id="phoneNumber"
          type="tel"
          inputMode="tel"
          className={`${inputClassName(!!errors.phoneNumber)} ${lockedCustomer ? "bg-cream-100 text-cocoa-500" : ""}`}
          value={form.phoneNumber}
          onChange={(e) => update("phoneNumber", e.target.value)}
          placeholder="e.g. 98765 43210"
          disabled={!!lockedCustomer}
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
        <div className="flex gap-2">
          <input
            id="productName"
            className={inputClassName(!!errors.productName)}
            value={form.productName}
            onChange={(e) => handleProductNameChange(e.target.value)}
            placeholder="e.g. Chocolate Truffle Cake"
          />
          <button
            type="button"
            onClick={() => setProductPickerOpen(true)}
            aria-label="Choose from price list"
            title="Choose from price list"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-300 bg-white text-cocoa-500"
          >
            <Tag className="h-5 w-5" aria-hidden />
          </button>
        </div>
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
            onChange={(e) => handleQuantityChange(e.target.value)}
          />
        </Field>
        <Field label="Unit" htmlFor="quantityUnit" required>
          <select
            id="quantityUnit"
            className={inputClassName()}
            value={form.quantityUnit}
            onChange={(e) => handleUnitChange(e.target.value as QuantityUnit)}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="pcs">pcs</option>
          </select>
        </Field>
      </div>

      <Field
        label="Total amount (Rs.)"
        htmlFor="totalAmount"
        required
        error={errors.totalAmount}
        hint={
          selectedRate !== null
            ? `Prefilled at ${formatCurrency(selectedRate.amount)}/${
                selectedRate.unit === "pcs" ? "pc" : "kg"
              } from your price list — you can still edit it.`
            : undefined
        }
      >
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

      <Field label="Payment status" htmlFor="paymentStatus" required>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => update("paymentStatus", status)}
              className={`h-11 rounded-xl border text-sm font-semibold ${
                form.paymentStatus === status
                  ? "border-berry-400 bg-blush-100 text-berry-600"
                  : "border-cream-300 bg-white text-cocoa-500"
              }`}
              aria-pressed={form.paymentStatus === status}
            >
              {status}
            </button>
          ))}
        </div>
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

      <ProductRatePickerSheet
        open={productPickerOpen}
        products={productRates}
        onSelect={handlePickProduct}
        onClose={() => setProductPickerOpen(false)}
      />
    </form>
  );
}
