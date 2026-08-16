import { describe, expect, it } from "vitest";
import { buildOccasionDateForYear, buildReminders, getNextOccurrence, isReminderEligible } from "../occasion";
import { makeOrder } from "./testFixtures";

describe("next birthday calculation", () => {
  it("computes days remaining to an upcoming birthday this year", () => {
    const today = new Date(2026, 7, 1); // Aug 1 2026
    const next = getNextOccurrence("1990-08-15", today);
    expect(next.dateStr).toBe("2026-08-15");
    expect(next.daysRemaining).toBe(14);
    expect(next.isOverdue).toBe(false);
  });

  it("marks a birthday that already passed this year as overdue", () => {
    const today = new Date(2026, 7, 20); // Aug 20 2026
    const next = getNextOccurrence("1990-08-15", today);
    expect(next.daysRemaining).toBe(-5);
    expect(next.isOverdue).toBe(true);
  });

  it("moves to the next cycle year once dismissed for the current year", () => {
    const today = new Date(2026, 7, 20);
    const next = getNextOccurrence("1990-08-15", today, 2026);
    expect(next.cycleYear).toBe(2027);
    expect(next.isOverdue).toBe(false);
  });
});

describe("leap-year reminder handling", () => {
  it("builds Feb 29 correctly in a leap year", () => {
    const date = buildOccasionDateForYear("1996-02-29", 2028);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(29);
  });

  it("observes Feb 29 occasions on Feb 28 in a non-leap year", () => {
    const date = buildOccasionDateForYear("1996-02-29", 2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(28);
  });

  it("does not crash or misbehave for a leap-day reminder just before Mar 1", () => {
    const today = new Date(2026, 1, 20); // Feb 20 2026, non-leap year
    const next = getNextOccurrence("1996-02-29", today);
    expect(next.dateStr).toBe("2026-02-28");
    expect(next.daysRemaining).toBe(8);
    expect(isReminderEligible(next.daysRemaining)).toBe(true);
  });
});

describe("reminder eligibility", () => {
  it("is eligible starting 30 days before the occurrence", () => {
    expect(isReminderEligible(30)).toBe(true);
    expect(isReminderEligible(31)).toBe(false);
  });

  it("stays eligible indefinitely while overdue", () => {
    expect(isReminderEligible(-100)).toBe(true);
  });

  it("only includes eligible, reminder-enabled birthday/anniversary orders", () => {
    const today = new Date(2026, 7, 1);
    const orders = [
      makeOrder({ id: "1", occasion: "Birthday", occasionDate: "1990-08-10", reminderEnabled: true }),
      makeOrder({ id: "2", occasion: "Birthday", occasionDate: "1990-12-25", reminderEnabled: true }),
      makeOrder({ id: "3", occasion: "None", occasionDate: null, reminderEnabled: false }),
      makeOrder({ id: "4", occasion: "Anniversary", occasionDate: "1990-08-05", reminderEnabled: false }),
    ];
    const reminders = buildReminders(orders, today);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].orderId).toBe("1");
  });
});
