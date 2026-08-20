import { describe, expect, it } from "vitest";
import {
  calculateAmountFromRate,
  defaultUnitForRate,
  findRateForProduct,
  isUnitCompatibleWithRate,
} from "../productRates";
import type { ProductRateRecord } from "@shared/types";

function makeRate(overrides: Partial<ProductRateRecord> = {}): ProductRateRecord {
  return {
    id: "rate-1",
    productName: "Brownie",
    category: "Brownie",
    rateUnit: "kg",
    rate: 1100,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateAmountFromRate", () => {
  it("computes amount directly for kg quantities", () => {
    expect(calculateAmountFromRate(1100, "kg", 1, "kg")).toBe(1100);
    expect(calculateAmountFromRate(1100, "kg", 1.5, "kg")).toBe(1650);
  });

  it("converts grams to kg before applying a kg rate", () => {
    expect(calculateAmountFromRate(1100, "kg", 500, "g")).toBe(550);
    expect(calculateAmountFromRate(1100, "kg", 250, "g")).toBe(275);
  });

  it("applies a pcs rate directly without unit conversion", () => {
    expect(calculateAmountFromRate(25, "pcs", 6, "pcs")).toBe(150);
    expect(calculateAmountFromRate(25, "pcs", 1, "pcs")).toBe(25);
  });

  it("rounds to the nearest whole rupee", () => {
    expect(calculateAmountFromRate(1000, "kg", 333, "g")).toBe(333);
  });
});

describe("isUnitCompatibleWithRate / defaultUnitForRate", () => {
  it("treats kg and g as compatible with a kg rate, but not pcs", () => {
    expect(isUnitCompatibleWithRate("kg", "kg")).toBe(true);
    expect(isUnitCompatibleWithRate("g", "kg")).toBe(true);
    expect(isUnitCompatibleWithRate("pcs", "kg")).toBe(false);
  });

  it("treats only pcs as compatible with a pcs rate", () => {
    expect(isUnitCompatibleWithRate("pcs", "pcs")).toBe(true);
    expect(isUnitCompatibleWithRate("kg", "pcs")).toBe(false);
    expect(isUnitCompatibleWithRate("g", "pcs")).toBe(false);
  });

  it("suggests a sensible default unit per rate type", () => {
    expect(defaultUnitForRate("kg")).toBe("kg");
    expect(defaultUnitForRate("pcs")).toBe("pcs");
  });
});

describe("findRateForProduct", () => {
  it("matches product names case- and whitespace-insensitively", () => {
    const rates = [makeRate({ productName: "Chocolate Truffle Cake" })];
    expect(findRateForProduct(rates, "  chocolate truffle cake  ")).toBe(rates[0]);
  });

  it("returns undefined when nothing matches", () => {
    const rates = [makeRate({ productName: "Brownie" })];
    expect(findRateForProduct(rates, "Cupcake")).toBeUndefined();
  });

  it("returns undefined for an empty product name", () => {
    expect(findRateForProduct([makeRate()], "   ")).toBeUndefined();
  });
});
