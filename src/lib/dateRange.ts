import { format, startOfMonth, subDays, subMonths } from "date-fns";
import type { DateRange, DateRangePreset } from "@shared/types";

export function formatDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parses a "yyyy-MM-dd" string as a local calendar date (no timezone shift). */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

export function getPresetRange(preset: DateRangePreset, today: Date = new Date()): DateRange {
  const end = formatDateOnly(today);
  switch (preset) {
    case "last7days":
      return { start: formatDateOnly(subDays(today, 6)), end };
    case "thisMonth":
      return { start: formatDateOnly(startOfMonth(today)), end };
    case "last6months":
      return { start: formatDateOnly(startOfMonth(subMonths(today, 5))), end };
    case "last1year":
      return { start: formatDateOnly(startOfMonth(subMonths(today, 11))), end };
    case "custom":
      return { start: end, end };
    default:
      return { start: end, end };
  }
}

/** Inclusive on both ends. "yyyy-MM-dd" strings sort lexically the same as chronologically. */
export function isWithinRange(dateStr: string, range: DateRange): boolean {
  return dateStr >= range.start && dateStr <= range.end;
}

export function filterByDateRange<T>(
  items: T[],
  range: DateRange,
  getDate: (item: T) => string,
): T[] {
  return items.filter((item) => isWithinRange(getDate(item), range));
}
