import { differenceInCalendarDays, isLeapYear, startOfDay } from "date-fns";
import type { OrderRecord, ReminderItem } from "@shared/types";
import { formatDateOnly, parseDateOnly } from "./dateRange";

/**
 * Builds an occasion date for a given year, safely handling Feb 29 occasions
 * in non-leap years by observing them on Feb 28 that year.
 */
export function buildOccasionDateForYear(occasionDate: string, year: number): Date {
  const parsed = parseDateOnly(occasionDate);
  const month = parsed.getMonth();
  const day = parsed.getDate();
  if (month === 1 && day === 29 && !isLeapYear(new Date(year, 0, 1))) {
    return new Date(year, 1, 28);
  }
  return new Date(year, month, day);
}

export interface NextOccurrence {
  date: Date;
  dateStr: string;
  cycleYear: number;
  daysRemaining: number;
  isOverdue: boolean;
}

/**
 * The reminder "cycle" for an occasion stays pinned to the current calendar
 * year until dismissed for that year — so a missed reminder shows as overdue
 * rather than silently jumping a full year ahead.
 */
export function getNextOccurrence(
  occasionDate: string,
  today: Date = new Date(),
  dismissedForYear?: number | null,
): NextOccurrence {
  const todayStart = startOfDay(today);
  let cycleYear = todayStart.getFullYear();
  if (dismissedForYear === cycleYear) {
    cycleYear += 1;
  }

  const candidate = buildOccasionDateForYear(occasionDate, cycleYear);
  const daysRemaining = differenceInCalendarDays(candidate, todayStart);

  return {
    date: candidate,
    dateStr: formatDateOnly(candidate),
    cycleYear,
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}

export function isReminderEligible(daysRemaining: number): boolean {
  return daysRemaining <= 30;
}

export function buildReminders(orders: OrderRecord[], today: Date = new Date()): ReminderItem[] {
  const reminders: ReminderItem[] = [];

  for (const order of orders) {
    if (!order.reminderEnabled || !order.occasionDate) continue;
    if (order.occasion !== "Birthday" && order.occasion !== "Anniversary") continue;

    const next = getNextOccurrence(order.occasionDate, today, order.reminderDismissedForYear);
    if (!isReminderEligible(next.daysRemaining)) continue;

    reminders.push({
      orderId: order.id,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      occasion: order.occasion,
      occasionDate: order.occasionDate,
      nextOccurrence: next.dateStr,
      daysRemaining: next.daysRemaining,
      isOverdue: next.isOverdue,
    });
  }

  return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function buildReminderMessage(customerName: string, occasion: "Birthday" | "Anniversary"): string {
  const firstName = customerName.trim().split(" ")[0] || customerName;
  const occasionLabel = occasion === "Birthday" ? "birthday" : "anniversary";
  return `Hi ${firstName}! Wishing you a wonderful ${occasionLabel} coming up. Would you like to order a special cake or brownies to celebrate? - After25 Cakes`;
}
