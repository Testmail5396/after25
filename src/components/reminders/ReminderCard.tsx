import { Gift, MessageCircle, Phone, X } from "lucide-react";
import type { ReminderItem } from "@shared/types";
import { formatDateDisplay } from "../../lib/format";
import { telHref, whatsappHref } from "../../lib/phone";
import { buildReminderMessage } from "../../lib/occasion";

interface ReminderCardProps {
  reminder: ReminderItem;
  onDismiss?: () => void;
  compact?: boolean;
}

export function ReminderCard({ reminder, onDismiss, compact = false }: ReminderCardProps) {
  const message = buildReminderMessage(reminder.customerName, reminder.occasion);

  const badge = reminder.isOverdue ? (
    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
      Overdue {Math.abs(reminder.daysRemaining)}d
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-blush-100 px-2 py-0.5 text-[11px] font-semibold text-berry-600">
      In {reminder.daysRemaining}d
    </span>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-card">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
          <Gift className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cocoa-700">{reminder.customerName}</p>
          <p className="truncate text-xs text-cocoa-500">
            {reminder.occasion} · {formatDateDisplay(reminder.nextOccurrence)}
          </p>
        </div>
        {badge}
      </div>
    );
  }

  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
            <Gift className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-cocoa-700">{reminder.customerName}</p>
            <p className="text-sm text-cocoa-500">
              {reminder.occasion} · {formatDateDisplay(reminder.nextOccurrence)}
            </p>
          </div>
        </div>
        {badge}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <div className="flex gap-2">
          <a
            href={telHref(reminder.phoneNumber)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-cocoa-600"
            aria-label={`Call ${reminder.customerName}`}
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
          <a
            href={whatsappHref(reminder.phoneNumber, message)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-cocoa-600"
            aria-label={`WhatsApp ${reminder.customerName}`}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-1.5 rounded-full px-3 h-11 text-sm font-medium text-cocoa-500 hover:bg-cream-200"
          >
            <X className="h-4 w-4" aria-hidden />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
