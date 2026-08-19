import { addDays, addMonths, addWeeks, format, startOfMonth, startOfWeek } from "date-fns";
import type { DateRange, OrderRecord, PurchaseRecord, TrendPoint } from "@shared/types";
import { parseDateOnly, formatDateOnly } from "./dateRange";

export type TrendGrouping = "day" | "week" | "month";

export function chooseTrendGrouping(range: DateRange): TrendGrouping {
  const start = parseDateOnly(range.start);
  const end = parseDateOnly(range.end);
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (spanDays <= 31) return "day";
  if (spanDays <= 180) return "week";
  return "month";
}

function bucketKey(dateStr: string, grouping: TrendGrouping): { key: string; label: string } {
  const date = parseDateOnly(dateStr);
  if (grouping === "day") {
    return { key: dateStr, label: format(date, "d MMM") };
  }
  if (grouping === "week") {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const key = formatDateOnly(weekStart);
    return { key, label: format(weekStart, "d MMM") };
  }
  const monthStart = startOfMonth(date);
  const key = formatDateOnly(monthStart);
  return { key, label: format(monthStart, "MMM yy") };
}

/**
 * Builds one bucket for every day/week/month across the whole range, even
 * ones with no sales or purchases — a trend line must show gaps as zero,
 * not skip them, otherwise it visually connects non-adjacent dates and
 * misrepresents the trend.
 */
function buildEmptyBuckets(range: DateRange, grouping: TrendGrouping): Map<string, TrendPoint> {
  const buckets = new Map<string, TrendPoint>();
  const rangeStart = parseDateOnly(range.start);
  const rangeEnd = parseDateOnly(range.end);

  if (grouping === "day") {
    let cursor = rangeStart;
    while (cursor <= rangeEnd) {
      const key = formatDateOnly(cursor);
      buckets.set(key, { label: format(cursor, "d MMM"), bucketStart: key, sales: 0, purchases: 0 });
      cursor = addDays(cursor, 1);
    }
  } else if (grouping === "week") {
    let cursor = startOfWeek(rangeStart, { weekStartsOn: 1 });
    const lastCursor = startOfWeek(rangeEnd, { weekStartsOn: 1 });
    while (cursor <= lastCursor) {
      const key = formatDateOnly(cursor);
      buckets.set(key, { label: format(cursor, "d MMM"), bucketStart: key, sales: 0, purchases: 0 });
      cursor = addWeeks(cursor, 1);
    }
  } else {
    let cursor = startOfMonth(rangeStart);
    const lastCursor = startOfMonth(rangeEnd);
    while (cursor <= lastCursor) {
      const key = formatDateOnly(cursor);
      buckets.set(key, { label: format(cursor, "MMM yy"), bucketStart: key, sales: 0, purchases: 0 });
      cursor = addMonths(cursor, 1);
    }
  }

  return buckets;
}

export function buildTrendData(
  orders: OrderRecord[],
  purchases: PurchaseRecord[],
  range: DateRange,
): TrendPoint[] {
  const grouping = chooseTrendGrouping(range);
  const buckets = buildEmptyBuckets(range, grouping);

  for (const order of orders) {
    const { key } = bucketKey(order.saleDate, grouping);
    const point = buckets.get(key);
    if (point) point.sales += order.totalAmount;
  }

  for (const purchase of purchases) {
    const { key } = bucketKey(purchase.purchaseDate, grouping);
    const point = buckets.get(key);
    if (point) point.purchases += purchase.totalAmount;
  }

  return Array.from(buckets.values()).sort((a, b) => (a.bucketStart < b.bucketStart ? -1 : 1));
}
