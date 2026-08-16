import { format } from "date-fns";
import { parseDateOnly } from "./dateRange";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDateDisplay(dateStr: string): string {
  return format(parseDateOnly(dateStr), "d MMM yyyy");
}

export function formatDateDisplayShort(dateStr: string): string {
  return format(parseDateOnly(dateStr), "d MMM");
}
