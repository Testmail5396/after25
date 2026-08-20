import { format, getDaysInMonth } from "date-fns";
import type { OrderRecord } from "@shared/types";
import { normalizePhoneNumber } from "./phone";
import { parseDateOnly } from "./dateRange";
import { buildOccasionDateForYear, buildReminderMessage } from "./occasion";

export interface MonthlyEvent {
  key: string;
  customerName: string;
  phoneNumber: string;
  type: "Birthday" | "Anniversary" | "Recurring";
  date: Date;
  dateLabel: string;
  detail: string;
  whatsappMessage: string;
}

interface MonthWindow {
  year: number;
  month: number;
}

function buildRecurringMessage(customerName: string, productName: string): string {
  const firstName = customerName.trim().split(" ")[0] || customerName;
  return `Hi ${firstName}! Around this time last year, you ordered ${productName} from us. This year too, we'd love to make it for you again whenever you're ready - After25 Cakes`;
}

/**
 * What's coming up this month and next, for planning ahead — not just the
 * "needs follow-up" reminder list. Combines two sources:
 *  1. Customers with a Birthday/Anniversary occasion date landing in either month.
 *  2. Customers who don't have an occasion tagged, but ordered in that same
 *     calendar month in a previous year and haven't ordered yet in that month
 *     this year — a likely repeat customer, surfaced from raw order history alone.
 * Only includes dates from today onward (this is a forward planning list, not
 * a record of what already happened).
 */
export function buildMonthlyEvents(orders: OrderRecord[], referenceDate: Date = new Date(), monthsAhead = 2): MonthlyEvent[] {
  const todayStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const monthWindows: MonthWindow[] = Array.from({ length: monthsAhead }, (_, i) => {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const events: MonthlyEvent[] = [];
  const occasionCustomerKeys = new Set<string>();

  const occasionSeen = new Map<string, OrderRecord>();
  for (const order of orders) {
    if ((order.occasion !== "Birthday" && order.occasion !== "Anniversary") || !order.occasionDate) continue;
    const occasionMonth = parseDateOnly(order.occasionDate).getMonth();
    if (!monthWindows.some((w) => w.month === occasionMonth)) continue;

    const customerKey = normalizePhoneNumber(order.phoneNumber) || order.phoneNumber;
    const dedupeKey = `${customerKey}|${order.occasion}`;
    const existing = occasionSeen.get(dedupeKey);
    if (!existing || order.updatedAt > existing.updatedAt) {
      occasionSeen.set(dedupeKey, order);
    }
  }

  for (const order of occasionSeen.values()) {
    const customerKey = normalizePhoneNumber(order.phoneNumber) || order.phoneNumber;
    const window = monthWindows.find((w) => w.month === parseDateOnly(order.occasionDate!).getMonth())!;
    const occasionDate = buildOccasionDateForYear(order.occasionDate!, window.year);
    if (occasionDate < todayStart) continue;

    occasionCustomerKeys.add(customerKey);
    events.push({
      key: `${customerKey}-${order.occasion}`,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      type: order.occasion as "Birthday" | "Anniversary",
      date: occasionDate,
      dateLabel: format(occasionDate, "d MMM"),
      detail: order.occasion,
      whatsappMessage: buildReminderMessage(order.customerName, order.occasion as "Birthday" | "Anniversary"),
    });
  }

  const byCustomer = new Map<string, OrderRecord[]>();
  for (const order of orders) {
    const customerKey = normalizePhoneNumber(order.phoneNumber) || order.phoneNumber;
    const list = byCustomer.get(customerKey);
    if (list) list.push(order);
    else byCustomer.set(customerKey, [order]);
  }

  for (const [customerKey, customerOrders] of byCustomer) {
    if (occasionCustomerKeys.has(customerKey)) continue;

    for (const window of monthWindows) {
      const orderedThisWindow = customerOrders.some((o) => {
        const d = parseDateOnly(o.saleDate);
        return d.getMonth() === window.month && d.getFullYear() === window.year;
      });
      if (orderedThisWindow) continue;

      const pastMatches = customerOrders
        .map((o) => ({ order: o, date: parseDateOnly(o.saleDate) }))
        .filter(({ date }) => date.getMonth() === window.month && date.getFullYear() < window.year)
        .sort((a, b) => b.date.getFullYear() - a.date.getFullYear() || b.date.getDate() - a.date.getDate());

      if (pastMatches.length === 0) continue;

      const match = pastMatches[0];
      const projectedDay = Math.min(match.date.getDate(), getDaysInMonth(new Date(window.year, window.month, 1)));
      const projectedDate = new Date(window.year, window.month, projectedDay);
      if (projectedDate < todayStart) continue;

      events.push({
        key: `${customerKey}-recurring-${window.year}-${window.month}`,
        customerName: match.order.customerName,
        phoneNumber: match.order.phoneNumber,
        type: "Recurring",
        date: projectedDate,
        dateLabel: format(projectedDate, "d MMM"),
        detail: `${match.order.productName} · ${match.date.getFullYear()}`,
        whatsappMessage: buildRecurringMessage(match.order.customerName, match.order.productName),
      });
      break;
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
