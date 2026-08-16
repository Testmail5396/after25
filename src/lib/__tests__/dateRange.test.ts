import { describe, expect, it } from "vitest";
import { filterByDateRange, getPresetRange, isWithinRange } from "../dateRange";

describe("date range boundaries", () => {
  it("includes items exactly on the start and end dates", () => {
    const range = { start: "2026-01-01", end: "2026-01-31" };
    expect(isWithinRange("2026-01-01", range)).toBe(true);
    expect(isWithinRange("2026-01-31", range)).toBe(true);
  });

  it("excludes items just outside the range", () => {
    const range = { start: "2026-01-01", end: "2026-01-31" };
    expect(isWithinRange("2025-12-31", range)).toBe(false);
    expect(isWithinRange("2026-02-01", range)).toBe(false);
  });

  it("filterByDateRange keeps only in-range items", () => {
    const items = [
      { date: "2026-01-01", value: 1 },
      { date: "2026-01-15", value: 2 },
      { date: "2026-02-01", value: 3 },
    ];
    const result = filterByDateRange(items, { start: "2026-01-01", end: "2026-01-31" }, (i) => i.date);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.value)).toEqual([1, 2]);
  });

  it("last7days preset spans exactly 7 days inclusive of today", () => {
    const today = new Date(2026, 7, 15); // Aug 15 2026
    const range = getPresetRange("last7days", today);
    expect(range).toEqual({ start: "2026-08-09", end: "2026-08-15" });
  });

  it("thisMonth preset starts on the 1st of the current month", () => {
    const today = new Date(2026, 7, 15);
    const range = getPresetRange("thisMonth", today);
    expect(range.start).toBe("2026-08-01");
    expect(range.end).toBe("2026-08-15");
  });
});
