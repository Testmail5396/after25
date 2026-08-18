import { todayDateOnly } from "./dateRange";
import { formatDateDisplay, formatDateDisplayShort } from "./format";

export interface DateGroup<T> {
  dateKey: string;
  items: T[];
}

/** Groups consecutive items sharing the same date into sections, preserving the list's existing order. */
export function groupConsecutiveByDate<T>(items: T[], getDate: (item: T) => string): DateGroup<T>[] {
  const groups: DateGroup<T>[] = [];

  for (const item of items) {
    const dateKey = getDate(item);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.items.push(item);
    } else {
      groups.push({ dateKey, items: [item] });
    }
  }

  return groups;
}

/** "Today (18 Aug)" for today's date, otherwise the full display date. */
export function dateGroupHeaderLabel(dateKey: string): string {
  if (dateKey === todayDateOnly()) {
    return `Today (${formatDateDisplayShort(dateKey)})`;
  }
  return formatDateDisplay(dateKey);
}
