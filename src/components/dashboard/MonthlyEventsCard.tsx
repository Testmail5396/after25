import { CalendarHeart, Gift, MessageCircle, Repeat } from "lucide-react";
import type { MonthlyEvent } from "../../lib/monthlyEvents";
import { whatsappHref } from "../../lib/phone";

interface MonthlyEventsCardProps {
  events: MonthlyEvent[];
  monthLabel: string;
}

const TYPE_META: Record<MonthlyEvent["type"], { label: string; icon: typeof Gift; className: string }> = {
  Birthday: { label: "Birthday", icon: Gift, className: "bg-blush-100 text-berry-600" },
  Anniversary: { label: "Anniversary", icon: CalendarHeart, className: "bg-blush-100 text-berry-600" },
  Recurring: { label: "Repeat customer", icon: Repeat, className: "bg-cream-200 text-cocoa-600" },
};

/** Forward-looking "what's coming up this month" list — occasion dates plus customers who likely repeat-order based on last year's pattern. */
export function MonthlyEventsCard({ events, monthLabel }: MonthlyEventsCardProps) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-sm text-cocoa-400">Nothing coming up in {monthLabel} yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => {
        const meta = TYPE_META[event.type];
        const Icon = meta.icon;
        return (
          <div key={event.key} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-card">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cocoa-700">{event.customerName}</p>
              <p className="truncate text-xs text-cocoa-500">
                {meta.label} · {event.dateLabel}
                {event.type === "Recurring" ? ` · ${event.detail}` : ""}
              </p>
            </div>
            <a
              href={whatsappHref(event.phoneNumber, event.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Message ${event.customerName}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200 text-cocoa-600"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
            </a>
          </div>
        );
      })}
    </div>
  );
}
