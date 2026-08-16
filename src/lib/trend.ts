import { format, startOfWeek, startOfMonth } from "date-fns";
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

export function buildTrendData(
  orders: OrderRecord[],
  purchases: PurchaseRecord[],
  range: DateRange,
): TrendPoint[] {
  const grouping = chooseTrendGrouping(range);
  const buckets = new Map<string, TrendPoint>();

  for (const order of orders) {
    const { key, label } = bucketKey(order.saleDate, grouping);
    const point = buckets.get(key) ?? { label, bucketStart: key, sales: 0, purchases: 0 };
    point.sales += order.totalAmount;
    buckets.set(key, point);
  }

  for (const purchase of purchases) {
    const { key, label } = bucketKey(purchase.purchaseDate, grouping);
    const point = buckets.get(key) ?? { label, bucketStart: key, sales: 0, purchases: 0 };
    point.purchases += purchase.totalAmount;
    buckets.set(key, point);
  }

  return Array.from(buckets.values()).sort((a, b) => (a.bucketStart < b.bucketStart ? -1 : 1));
}
