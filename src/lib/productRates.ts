import type { ProductRateRecord, QuantityUnit, RateUnit } from "@shared/types";

/** Whether a sale's quantity unit makes sense for a given catalog rate — pcs-priced items can't be sold by weight. */
export function isUnitCompatibleWithRate(unit: QuantityUnit, rateUnit: RateUnit): boolean {
  return rateUnit === "pcs" ? unit === "pcs" : unit === "kg" || unit === "g";
}

/** The quantity unit to switch to when a rate is applied but the current unit doesn't fit it. */
export function defaultUnitForRate(rateUnit: RateUnit): QuantityUnit {
  return rateUnit === "pcs" ? "pcs" : "kg";
}

/** Suggested sale amount for a quantity at a given catalog rate — grams are converted to kg first; pcs rates apply directly. */
export function calculateAmountFromRate(rate: number, rateUnit: RateUnit, quantity: number, unit: QuantityUnit): number {
  if (rateUnit === "pcs") {
    return Math.round(rate * quantity);
  }
  const quantityInKg = unit === "g" ? quantity / 1000 : quantity;
  return Math.round(rate * quantityInKg);
}

/** Finds a catalog rate by product name, case/whitespace-insensitive. */
export function findRateForProduct(rates: ProductRateRecord[], productName: string): ProductRateRecord | undefined {
  const normalized = productName.trim().toLowerCase();
  if (!normalized) return undefined;
  return rates.find((r) => r.productName.trim().toLowerCase() === normalized);
}
