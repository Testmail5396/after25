import { describe, expect, it } from "vitest";
import { buildMonthlyEvents } from "../monthlyEvents";
import { makeOrder } from "./testFixtures";

// Reference "today" used across these tests: 10 Aug 2026
const REFERENCE = new Date(2026, 7, 10);

describe("buildMonthlyEvents", () => {
  it("includes an upcoming birthday landing later this month", () => {
    const orders = [
      makeOrder({
        id: "1",
        customerName: "Sinu Akka",
        phoneNumber: "9876500000",
        occasion: "Birthday",
        occasionDate: "2020-08-22",
      }),
    ];
    const events = buildMonthlyEvents(orders, REFERENCE);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("Birthday");
    expect(events[0].customerName).toBe("Sinu Akka");
    expect(events[0].date.getDate()).toBe(22);
  });

  it("includes a birthday landing next month", () => {
    const orders = [
      makeOrder({
        id: "1",
        customerName: "Next Monther",
        occasion: "Birthday",
        occasionDate: "2020-09-05",
      }),
    ];
    const events = buildMonthlyEvents(orders, REFERENCE);
    expect(events).toHaveLength(1);
    expect(events[0].date.getMonth()).toBe(8); // September
  });

  it("excludes an occasion date that already passed this month", () => {
    const orders = [
      makeOrder({
        id: "1",
        customerName: "Past Person",
        occasionDate: "2020-08-05",
        occasion: "Anniversary",
      }),
    ];
    expect(buildMonthlyEvents(orders, REFERENCE)).toHaveLength(0);
  });

  it("excludes occasions beyond the current+next month window", () => {
    const orders = [makeOrder({ id: "1", occasion: "Birthday", occasionDate: "2020-10-15" })];
    expect(buildMonthlyEvents(orders, REFERENCE)).toHaveLength(0);
  });

  it("flags a recurring customer who ordered in this month last year but not yet this year", () => {
    const orders = [
      makeOrder({
        id: "1",
        customerName: "Repeat Rani",
        phoneNumber: "9988700000",
        productName: "Vanilla Cake",
        saleDate: "2025-08-15",
        occasion: "None",
        occasionDate: null,
      }),
    ];
    const events = buildMonthlyEvents(orders, REFERENCE);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("Recurring");
    expect(events[0].customerName).toBe("Repeat Rani");
    expect(events[0].date.getDate()).toBe(15);
    expect(events[0].detail).toContain("Vanilla Cake");
  });

  it("does not flag a recurring customer who already ordered this month this year", () => {
    const orders = [
      makeOrder({ id: "1", phoneNumber: "9988700000", saleDate: "2025-08-15", occasion: "None", occasionDate: null }),
      makeOrder({ id: "2", phoneNumber: "9988700000", saleDate: "2026-08-02", occasion: "None", occasionDate: null }),
    ];
    expect(buildMonthlyEvents(orders, REFERENCE)).toHaveLength(0);
  });

  it("does not double-count a customer as both an occasion event and a recurring one", () => {
    const orders = [
      makeOrder({
        id: "1",
        phoneNumber: "9876500000",
        occasion: "Birthday",
        occasionDate: "2020-08-22",
        saleDate: "2025-08-22",
      }),
    ];
    expect(buildMonthlyEvents(orders, REFERENCE)).toHaveLength(1);
  });

  it("sorts events chronologically across both months", () => {
    const orders = [
      makeOrder({ id: "1", customerName: "NextMonth", phoneNumber: "9111100000", occasion: "Birthday", occasionDate: "2020-09-03" }),
      makeOrder({ id: "2", customerName: "Sooner", phoneNumber: "9222200000", occasion: "Anniversary", occasionDate: "2020-08-12" }),
      makeOrder({ id: "3", customerName: "Later", phoneNumber: "9333300000", occasion: "Birthday", occasionDate: "2020-08-28" }),
    ];
    const events = buildMonthlyEvents(orders, REFERENCE);
    expect(events.map((e) => e.customerName)).toEqual(["Sooner", "Later", "NextMonth"]);
  });
});
