import { describe, expect, it } from "vitest";
import {
  averageOrderValue,
  buildDashboardMetrics,
  categoryRevenue,
  netCashBalance,
} from "../calculations";
import { makeOrder, makePurchase } from "./testFixtures";

describe("cake vs brownie totals", () => {
  it("sums revenue only for the matching product category", () => {
    const orders = [
      makeOrder({ id: "1", productCategory: "Cake", totalAmount: 1000 }),
      makeOrder({ id: "2", productCategory: "Brownie", totalAmount: 300 }),
      makeOrder({ id: "3", productCategory: "Cake", totalAmount: 500 }),
    ];
    expect(categoryRevenue(orders, "Cake")).toBe(1500);
    expect(categoryRevenue(orders, "Brownie")).toBe(300);
  });

  it("does not use free-text product name matching", () => {
    const orders = [
      makeOrder({ id: "1", productCategory: "Brownie", productName: "Cake-shaped brownie box", totalAmount: 400 }),
    ];
    expect(categoryRevenue(orders, "Cake")).toBe(0);
    expect(categoryRevenue(orders, "Brownie")).toBe(400);
  });
});

describe("net cash balance", () => {
  it("equals total sales minus total purchases", () => {
    const orders = [makeOrder({ id: "1", totalAmount: 2000 }), makeOrder({ id: "2", totalAmount: 1000 })];
    const purchases = [makePurchase({ id: "1", totalAmount: 800 })];
    expect(netCashBalance(orders, purchases)).toBe(2200);
  });

  it("can be negative when purchases exceed sales", () => {
    const orders = [makeOrder({ id: "1", totalAmount: 200 })];
    const purchases = [makePurchase({ id: "1", totalAmount: 900 })];
    expect(netCashBalance(orders, purchases)).toBe(-700);
  });
});

describe("average order value", () => {
  it("returns 0 when there are no orders", () => {
    expect(averageOrderValue([])).toBe(0);
  });

  it("divides total sales by order count", () => {
    const orders = [makeOrder({ id: "1", totalAmount: 300 }), makeOrder({ id: "2", totalAmount: 700 })];
    expect(averageOrderValue(orders)).toBe(500);
  });
});

describe("dashboard metrics", () => {
  it("combines all figures consistently", () => {
    const orders = [
      makeOrder({ id: "1", productCategory: "Cake", totalAmount: 1000 }),
      makeOrder({ id: "2", productCategory: "Brownie", totalAmount: 500 }),
    ];
    const purchases = [makePurchase({ id: "1", totalAmount: 600 })];
    const metrics = buildDashboardMetrics(orders, purchases);
    expect(metrics).toEqual({
      totalSales: 1500,
      totalPurchases: 600,
      netCashBalance: 900,
      cakeSales: 1000,
      brownieSales: 500,
      totalOrders: 2,
      averageOrderValue: 750,
    });
  });
});
