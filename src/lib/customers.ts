import type { CustomerSummary, OrderRecord } from "@shared/types";
import { normalizePhoneNumber } from "./phone";

export function aggregateCustomers(orders: OrderRecord[]): CustomerSummary[] {
  const groups = new Map<string, OrderRecord[]>();

  for (const order of orders) {
    const key = normalizePhoneNumber(order.phoneNumber) || order.phoneNumber;
    const existing = groups.get(key);
    if (existing) {
      existing.push(order);
    } else {
      groups.set(key, [order]);
    }
  }

  const summaries: CustomerSummary[] = [];
  for (const [key, group] of groups) {
    const sorted = [...group].sort((a, b) => (a.saleDate < b.saleDate ? -1 : 1));
    const totalSpent = group.reduce((sum, o) => sum + o.totalAmount, 0);
    const cakeSpent = group
      .filter((o) => o.productCategory === "Cake")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const brownieSpent = group
      .filter((o) => o.productCategory === "Brownie")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const latest = [...group].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

    summaries.push({
      key,
      name: latest.customerName,
      phoneNumber: latest.phoneNumber,
      totalSpent,
      orderCount: group.length,
      averageOrderValue: totalSpent / group.length,
      firstOrderDate: sorted[0].saleDate,
      lastOrderDate: sorted[sorted.length - 1].saleDate,
      cakeSpent,
      brownieSpent,
    });
  }

  return summaries;
}

export function getTopSpender(customers: CustomerSummary[]): CustomerSummary | null {
  if (customers.length === 0) return null;
  return customers.reduce((top, c) => (c.totalSpent > top.totalSpent ? c : top));
}

export function getMostFrequentCustomer(customers: CustomerSummary[]): CustomerSummary | null {
  if (customers.length === 0) return null;
  return customers.reduce((top, c) => (c.orderCount > top.orderCount ? c : top));
}

export function getReturningCustomers(customers: CustomerSummary[], minOrders = 2): CustomerSummary[] {
  return customers
    .filter((c) => c.orderCount >= minOrders)
    .sort((a, b) => b.orderCount - a.orderCount);
}
