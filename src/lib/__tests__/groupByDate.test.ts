import { describe, expect, it } from "vitest";
import { dateGroupHeaderLabel, groupConsecutiveByDate } from "../groupByDate";
import { todayDateOnly } from "../dateRange";

describe("groupConsecutiveByDate", () => {
  it("groups consecutive same-date items together, preserving order", () => {
    const items = [
      { id: "1", date: "2026-08-18" },
      { id: "2", date: "2026-08-18" },
      { id: "3", date: "2026-08-17" },
      { id: "4", date: "2026-08-14" },
    ];
    const groups = groupConsecutiveByDate(items, (i) => i.date);
    expect(groups).toHaveLength(3);
    expect(groups[0]).toMatchObject({ dateKey: "2026-08-18", items: [{ id: "1", date: "2026-08-18" }, { id: "2", date: "2026-08-18" }] });
    expect(groups[1].dateKey).toBe("2026-08-17");
    expect(groups[2].dateKey).toBe("2026-08-14");
  });

  it("returns an empty array for no items", () => {
    expect(groupConsecutiveByDate([], (i: { date: string }) => i.date)).toEqual([]);
  });

  it("does not merge the same date if it reappears non-consecutively", () => {
    const items = [
      { id: "1", date: "2026-08-18" },
      { id: "2", date: "2026-08-17" },
      { id: "3", date: "2026-08-18" },
    ];
    const groups = groupConsecutiveByDate(items, (i) => i.date);
    expect(groups).toHaveLength(3);
  });
});

describe("dateGroupHeaderLabel", () => {
  it("labels today's date as Today (d MMM)", () => {
    const today = todayDateOnly();
    expect(dateGroupHeaderLabel(today)).toMatch(/^Today \(/);
  });

  it("labels other dates with the full display date", () => {
    expect(dateGroupHeaderLabel("2026-08-14")).toBe("14 Aug 2026");
  });
});
