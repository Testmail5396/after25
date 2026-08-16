import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Cake,
  Cookie,
  Wallet,
  ShoppingBag,
  Calculator,
  ChevronRight,
  BellRing,
} from "lucide-react";
import type { DateRangePreset } from "@shared/types";
import { useData } from "../context/DataContext";
import { buildDashboardMetrics } from "../lib/calculations";
import { buildTrendData } from "../lib/trend";
import { buildReminders } from "../lib/occasion";
import { filterByDateRange, getPresetRange, todayDateOnly } from "../lib/dateRange";
import { formatCurrency } from "../lib/format";
import { MetricCard } from "../components/dashboard/MetricCard";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { TrendChart } from "../components/dashboard/TrendChart";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { ReminderCard } from "../components/reminders/ReminderCard";
import { CardSkeleton } from "../components/ui/Skeleton";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

export function DashboardPage() {
  const { orders, purchases, loading, dismissReminder } = useData();
  const [preset, setPreset] = useState<DateRangePreset>("thisMonth");
  const [customStart, setCustomStart] = useState(todayDateOnly());
  const [customEnd, setCustomEnd] = useState(todayDateOnly());

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd };
    return getPresetRange(preset);
  }, [preset, customStart, customEnd]);

  const filteredOrders = useMemo(() => filterByDateRange(orders, range, (o) => o.saleDate), [orders, range]);
  const filteredPurchases = useMemo(
    () => filterByDateRange(purchases, range, (p) => p.purchaseDate),
    [purchases, range],
  );

  const metrics = useMemo(() => buildDashboardMetrics(filteredOrders, filteredPurchases), [filteredOrders, filteredPurchases]);
  const trendData = useMemo(() => buildTrendData(filteredOrders, filteredPurchases, range), [filteredOrders, filteredPurchases, range]);
  const reminders = useMemo(() => buildReminders(orders).slice(0, 3), [orders]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Dashboard</h1>
        <p className="text-sm text-cocoa-500">A quick look at how the bakery is doing.</p>
      </div>

      <DateRangeFilter
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Total Sales" value={formatCurrency(metrics.totalSales)} icon={Banknote} />
            <MetricCard label="Total Purchases" value={formatCurrency(metrics.totalPurchases)} icon={Wallet} />
            <MetricCard
              label="Net Cash Balance"
              value={formatCurrency(metrics.netCashBalance)}
              icon={Calculator}
              tone={metrics.netCashBalance >= 0 ? "positive" : "negative"}
            />
            <MetricCard label="Total Orders" value={String(metrics.totalOrders)} icon={ShoppingBag} />
            <MetricCard label="Cake Sales" value={formatCurrency(metrics.cakeSales)} icon={Cake} />
            <MetricCard label="Brownie Sales" value={formatCurrency(metrics.brownieSales)} icon={Cookie} />
            <MetricCard
              label="Average Order Value"
              value={formatCurrency(metrics.averageOrderValue)}
              icon={Calculator}
            />
          </div>

          <Card>
            <p className="mb-1 text-sm font-semibold text-cocoa-600">Sales vs Purchases</p>
            {trendData.length === 0 ? (
              <p className="py-8 text-center text-sm text-cocoa-400">No data for this period yet.</p>
            ) : (
              <TrendChart data={trendData} />
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Cake vs Brownie Revenue</p>
            <CategoryChart cakeRevenue={metrics.cakeSales} brownieRevenue={metrics.brownieSales} />
          </Card>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-cocoa-600">
                <BellRing className="h-4 w-4 text-berry-500" aria-hidden />
                Reminders
              </p>
              <Link to="/more/reminders" className="flex items-center text-sm font-medium text-berry-500">
                View all
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            {reminders.length === 0 ? (
              <EmptyState icon={BellRing} title="No reminders due" description="Occasion reminders will appear here 30 days before they're due." />
            ) : (
              <div className="flex flex-col gap-3">
                {reminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.orderId}
                    reminder={reminder}
                    onDismiss={() => dismissReminder(reminder.orderId, Number(reminder.nextOccurrence.slice(0, 4)))}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
