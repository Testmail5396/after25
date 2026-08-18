import { describe, expect, it } from "vitest";
import { buildCategoryBreakdown, buildProductBreakdown, buildWeekdayPattern } from "../insights";
import { makeOrder } from "./testFixtures";

describe("weekday order pattern", () => {
  it("buckets orders into the correct Monday-first weekday", () => {
    // 2026-08-17 is a Monday, 2026-08-23 is a Sunday
    const orders = [
      makeOrder({ id: "1", saleDate: "2026-08-17", totalAmount: 100 }), // Mon
      makeOrder({ id: "2", saleDate: "2026-08-17", totalAmount: 50 }), // Mon
      makeOrder({ id: "3", saleDate: "2026-08-23", totalAmount: 200 }), // Sun
    ];
    const pattern = buildWeekdayPattern(orders);
    expect(pattern).toHaveLength(7);
    expect(pattern[0]).toMatchObject({ day: "Mon", orderCount: 2, revenue: 150 });
    expect(pattern[6]).toMatchObject({ day: "Sun", orderCount: 1, revenue: 200 });
    expect(pattern[1].orderCount).toBe(0);
  });

  it("returns all-zero buckets for an empty order list", () => {
    const pattern = buildWeekdayPattern([]);
    expect(pattern.every((p) => p.orderCount === 0 && p.revenue === 0)).toBe(true);
  });
});

describe("category breakdown", () => {
  it("aggregates revenue, order count and percentage per category, beyond just Cake/Brownie", () => {
    const orders = [
      makeOrder({ id: "1", productCategory: "Cake", totalAmount: 1000 }),
      makeOrder({ id: "2", productCategory: "Cupcake", totalAmount: 500 }),
      makeOrder({ id: "3", productCategory: "Cupcake", totalAmount: 500 }),
    ];
    const breakdown = buildCategoryBreakdown(orders);
    expect(breakdown).toHaveLength(2);
    const cake = breakdown.find((b) => b.category === "Cake");
    const cupcake = breakdown.find((b) => b.category === "Cupcake");
    expect(cake).toMatchObject({ revenue: 1000, orderCount: 1, percentage: 50 });
    expect(cupcake).toMatchObject({ revenue: 1000, orderCount: 2, percentage: 50 });
  });

  it("sorts highest revenue first", () => {
    const orders = [
      makeOrder({ id: "1", productCategory: "Biscuits", totalAmount: 100 }),
      makeOrder({ id: "2", productCategory: "Bento Cake", totalAmount: 900 }),
    ];
    const breakdown = buildCategoryBreakdown(orders);
    expect(breakdown[0].category).toBe("Bento Cake");
  });
});

describe("product breakdown", () => {
  it("aggregates the same product name case/whitespace-insensitively", () => {
    const orders = [
      makeOrder({ id: "1", productName: "Chocolate Truffle Cake", quantity: 1, totalAmount: 1000 }),
      makeOrder({ id: "2", productName: " chocolate truffle cake ", quantity: 1, totalAmount: 1200 }),
      makeOrder({ id: "3", productName: "Red Velvet Cake", quantity: 1, totalAmount: 800 }),
    ];
    const breakdown = buildProductBreakdown(orders);
    expect(breakdown).toHaveLength(2);
    const truffle = breakdown.find((b) => b.productName.toLowerCase() === "chocolate truffle cake");
    expect(truffle).toMatchObject({ quantitySold: 2, orderCount: 2, revenue: 2200 });
  });

  it("sorts by revenue descending", () => {
    const orders = [
      makeOrder({ id: "1", productName: "Small Cake", totalAmount: 200 }),
      makeOrder({ id: "2", productName: "Big Cake", totalAmount: 2000 }),
    ];
    const breakdown = buildProductBreakdown(orders);
    expect(breakdown[0].productName).toBe("Big Cake");
  });
});
