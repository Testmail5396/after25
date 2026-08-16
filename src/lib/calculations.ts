import type { DashboardMetrics, OrderRecord, PurchaseRecord } from "@shared/types";

export function sumSales(orders: OrderRecord[]): number {
  return orders.reduce((total, order) => total + order.totalAmount, 0);
}

export function sumPurchases(purchases: PurchaseRecord[]): number {
  return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
}

/** Net cash balance = total sales - total purchases. Not an accounting profit figure. */
export function netCashBalance(orders: OrderRecord[], purchases: PurchaseRecord[]): number {
  return sumSales(orders) - sumPurchases(purchases);
}

export function categoryRevenue(orders: OrderRecord[], category: "Cake" | "Brownie"): number {
  return orders
    .filter((order) => order.productCategory === category)
    .reduce((total, order) => total + order.totalAmount, 0);
}

export function averageOrderValue(orders: OrderRecord[]): number {
  if (orders.length === 0) return 0;
  return sumSales(orders) / orders.length;
}

export function buildDashboardMetrics(
  orders: OrderRecord[],
  purchases: PurchaseRecord[],
): DashboardMetrics {
  const totalSales = sumSales(orders);
  const totalPurchases = sumPurchases(purchases);
  return {
    totalSales,
    totalPurchases,
    netCashBalance: totalSales - totalPurchases,
    cakeSales: categoryRevenue(orders, "Cake"),
    brownieSales: categoryRevenue(orders, "Brownie"),
    totalOrders: orders.length,
    averageOrderValue: averageOrderValue(orders),
  };
}
