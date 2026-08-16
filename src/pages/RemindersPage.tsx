import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BellRing, Info } from "lucide-react";
import { useData } from "../context/DataContext";
import { buildReminders } from "../lib/occasion";
import { useToast } from "../components/ui/Toast";
import { ReminderCard } from "../components/reminders/ReminderCard";
import { EmptyState } from "../components/ui/EmptyState";

export function RemindersPage() {
  const { orders, dismissReminder } = useData();
  const { showToast } = useToast();

  const reminders = useMemo(() => buildReminders(orders), [orders]);

  async function handleDismiss(orderId: string, nextOccurrence: string) {
    try {
      await dismissReminder(orderId, Number(nextOccurrence.slice(0, 4)));
      showToast("success", "Reminder dismissed");
    } catch {
      showToast("error", "Could not dismiss this reminder");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/more" className="flex items-center gap-1 text-sm font-medium text-cocoa-500">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to more
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Reminders</h1>
        <p className="text-sm text-cocoa-500">Upcoming and overdue birthday &amp; anniversary occasions.</p>
      </div>

      <div className="flex gap-2 rounded-xl2 bg-blush-100 p-3 text-xs text-cocoa-600">
        <Info className="h-4 w-4 shrink-0 text-berry-500" aria-hidden />
        <p>
          This is an in-app reminder list only. It does not send push notifications, emails, or WhatsApp messages
          automatically — use the call or WhatsApp buttons to reach out yourself.
        </p>
      </div>

      {reminders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No reminders due"
          description="Reminders appear here starting 30 days before a customer's birthday or anniversary."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.orderId}
              reminder={reminder}
              onDismiss={() => handleDismiss(reminder.orderId, reminder.nextOccurrence)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
