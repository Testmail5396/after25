import type { OrderRecord, ProductCategory } from "@shared/types";
import { parseDateOnly } from "./dateRange";

export interface WeekdayPattern {
  day: string;
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  orderCount: number;
  revenue: number;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Maps JS getDay() (0=Sun..6=Sat) to a Monday-first index (0=Mon..6=Sun). */
function toMondayFirstIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/** How many orders (and how much revenue) land on each day of the week — helps spot the busiest days. */
export function buildWeekdayPattern(orders: OrderRecord[]): WeekdayPattern[] {
  const buckets: WeekdayPattern[] = WEEKDAY_LABELS.map((day, dayIndex) => ({
    day,
    dayIndex,
    orderCount: 0,
    revenue: 0,
  }));

  for (const order of orders) {
    const jsDay = parseDateOnly(order.saleDate).getDay();
    const bucket = buckets[toMondayFirstIndex(jsDay)];
    bucket.orderCount += 1;
    bucket.revenue += order.totalAmount;
  }

  return buckets;
}

export interface CategoryBreakdownItem {
  category: ProductCategory;
  revenue: number;
  orderCount: number;
  percentage: number;
}

/** Revenue + order count for every product category present in the given orders (not just Cake/Brownie). */
export function buildCategoryBreakdown(orders: OrderRecord[]): CategoryBreakdownItem[] {
  const totals = new Map<ProductCategory, { revenue: number; orderCount: number }>();

  for (const order of orders) {
    const existing = totals.get(order.productCategory) ?? { revenue: 0, orderCount: 0 };
    existing.revenue += order.totalAmount;
    existing.orderCount += 1;
    totals.set(order.productCategory, existing);
  }

  const grandTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return Array.from(totals.entries())
    .map(([category, { revenue, orderCount }]) => ({
      category,
      revenue,
      orderCount,
      percentage: grandTotal > 0 ? Math.round((revenue / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ProductBreakdownItem {
  productName: string;
  category: ProductCategory;
  quantitySold: number;
  quantityUnit: string;
  orderCount: number;
  revenue: number;
}

/** Aggregates orders by product name (case/whitespace-insensitive) to show what's actually selling. */
export function buildProductBreakdown(orders: OrderRecord[]): ProductBreakdownItem[] {
  const totals = new Map<string, ProductBreakdownItem>();

  for (const order of orders) {
    const key = `${order.productName.trim().toLowerCase()}__${order.quantityUnit}`;
    const existing = totals.get(key);
    if (existing) {
      existing.quantitySold += order.quantity;
      existing.orderCount += 1;
      existing.revenue += order.totalAmount;
    } else {
      totals.set(key, {
        productName: order.productName.trim(),
        category: order.productCategory,
        quantitySold: order.quantity,
        quantityUnit: order.quantityUnit,
        orderCount: 1,
        revenue: order.totalAmount,
      });
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue);
}
