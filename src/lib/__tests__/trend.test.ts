import { describe, expect, it } from "vitest";
import { buildTrendData, chooseTrendGrouping } from "../trend";
import { makeOrder, makePurchase } from "./testFixtures";

describe("chooseTrendGrouping", () => {
  it("groups by day for short ranges", () => {
    expect(chooseTrendGrouping({ start: "2026-08-01", end: "2026-08-10" })).toBe("day");
  });

  it("groups by week for medium ranges", () => {
    expect(chooseTrendGrouping({ start: "2026-01-01", end: "2026-05-01" })).toBe("week");
  });

  it("groups by month for long ranges", () => {
    expect(chooseTrendGrouping({ start: "2025-01-01", end: "2026-08-01" })).toBe("month");
  });
});

describe("buildTrendData", () => {
  it("fills gaps with zero-value buckets instead of skipping empty days", () => {
    const orders = [makeOrder({ id: "1", saleDate: "2026-08-01", totalAmount: 500 })];
    const purchases = [makePurchase({ id: "1", purchaseDate: "2026-08-05", totalAmount: 200 })];
    const range = { start: "2026-08-01", end: "2026-08-05" };

    const data = buildTrendData(orders, purchases, range);

    expect(data).toHaveLength(5);
    expect(data[0]).toMatchObject({ bucketStart: "2026-08-01", sales: 500, purchases: 0 });
    expect(data[1]).toMatchObject({ bucketStart: "2026-08-02", sales: 0, purchases: 0 });
    expect(data[2]).toMatchObject({ bucketStart: "2026-08-03", sales: 0, purchases: 0 });
    expect(data[3]).toMatchObject({ bucketStart: "2026-08-04", sales: 0, purchases: 0 });
    expect(data[4]).toMatchObject({ bucketStart: "2026-08-05", sales: 0, purchases: 200 });
  });

  it("returns an all-zero series when there is no data at all", () => {
    const range = { start: "2026-08-01", end: "2026-08-03" };
    const data = buildTrendData([], [], range);
    expect(data).toHaveLength(3);
    expect(data.every((p) => p.sales === 0 && p.purchases === 0)).toBe(true);
  });

  it("sorts buckets chronologically", () => {
    const range = { start: "2026-08-01", end: "2026-08-03" };
    const data = buildTrendData([], [], range);
    const starts = data.map((p) => p.bucketStart);
    expect(starts).toEqual(["2026-08-01", "2026-08-02", "2026-08-03"]);
  });

  it("aggregates weekly buckets across a medium range without gaps", () => {
    const orders = [
      makeOrder({ id: "1", saleDate: "2026-01-05", totalAmount: 100 }),
      makeOrder({ id: "2", saleDate: "2026-03-20", totalAmount: 300 }),
    ];
    const range = { start: "2026-01-01", end: "2026-05-01" };

    const data = buildTrendData(orders, [], range);

    expect(data.length).toBeGreaterThan(1);
    const totalSales = data.reduce((sum, p) => sum + p.sales, 0);
    expect(totalSales).toBe(400);
    const starts = data.map((p) => p.bucketStart);
    expect(new Set(starts).size).toBe(starts.length);
  });
});
