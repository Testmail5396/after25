import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingBag,
  Calculator,
  ChevronRight,
  BellRing,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DateRangePreset } from "@shared/types";
import { useData } from "../context/DataContext";
import { buildDashboardMetrics } from "../lib/calculations";
import { buildTrendData } from "../lib/trend";
import { buildReminders } from "../lib/occasion";
import { filterByDateRange, getPresetRange, todayDateOnly } from "../lib/dateRange";
import { formatCurrency, formatDateDisplayShort } from "../lib/format";
import { MobilePageHeader } from "../components/layout/MobilePageHeader";
import { FilterBottomSheet } from "../components/ui/FilterBottomSheet";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { CompactMetricCard } from "../components/dashboard/CompactMetricCard";
import { TrendChart } from "../components/dashboard/TrendChart";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { ReminderCard } from "../components/reminders/ReminderCard";
import { CardSkeleton } from "../components/ui/Skeleton";
import { Card } from "../components/ui/Card";

const RANGE_LABELS: Record<DateRangePreset, string> = {
  last7days: "Last 7 days",
  thisMonth: "This month",
  last6months: "Last 6 months",
  last1year: "Last 1 year",
  custom: "Custom range",
};

export function DashboardPage() {
  const { orders, purchases, loading, dismissReminder } = useData();

  const [preset, setPreset] = useState<DateRangePreset>("last1year");
  const [customStart, setCustomStart] = useState(todayDateOnly());
  const [customEnd, setCustomEnd] = useState(todayDateOnly());

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<DateRangePreset>(preset);
  const [draftCustomStart, setDraftCustomStart] = useState(customStart);
  const [draftCustomEnd, setDraftCustomEnd] = useState(customEnd);

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd };
    return getPresetRange(preset);
  }, [preset, customStart, customEnd]);

  const rangeLabel =
    preset === "custom"
      ? `${formatDateDisplayShort(customStart)} – ${formatDateDisplayShort(customEnd)}`
      : RANGE_LABELS[preset];

  function openFilter() {
    setDraftPreset(preset);
    setDraftCustomStart(customStart);
    setDraftCustomEnd(customEnd);
    setFilterOpen(true);
  }

  function applyFilter() {
    setPreset(draftPreset);
    setCustomStart(draftCustomStart);
    setCustomEnd(draftCustomEnd);
    setFilterOpen(false);
  }

  function resetFilter() {
    setPreset("last1year");
    setDraftPreset("last1year");
    setFilterOpen(false);
  }

  const filteredOrders = useMemo(() => filterByDateRange(orders, range, (o) => o.saleDate), [orders, range]);
  const filteredPurchases = useMemo(
    () => filterByDateRange(purchases, range, (p) => p.purchaseDate),
    [purchases, range],
  );

  const metrics = useMemo(() => buildDashboardMetrics(filteredOrders, filteredPurchases), [filteredOrders, filteredPurchases]);
  const trendData = useMemo(() => buildTrendData(filteredOrders, filteredPurchases, range), [filteredOrders, filteredPurchases, range]);
  const reminders = useMemo(() => buildReminders(orders), [orders]);
  const visibleReminders = reminders.slice(0, 3);

  const netPositive = metrics.netCashBalance >= 0;
  const cakePct = metrics.totalSales > 0 ? Math.round((metrics.cakeSales / metrics.totalSales) * 100) : 0;
  const browniePct = metrics.totalSales > 0 ? Math.round((metrics.brownieSales / metrics.totalSales) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5">
      <MobilePageHeader
        title="Dashboard"
        action={
          <button
            type="button"
            onClick={openFilter}
            className="flex h-11 items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-cocoa-600"
          >
            <Calendar className="h-4 w-4 text-berry-500" aria-hidden />
            {rangeLabel}
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <div className="grid grid-cols-3 gap-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      ) : (
        <>
          <Card className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium text-cocoa-400">Total Sales</p>
              <p className="font-display text-3xl font-bold leading-tight text-cocoa-700">
                {formatCurrency(metrics.totalSales)}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-cream-200 pt-3">
              <span className="text-sm font-medium text-cocoa-500">Net Cash Balance</span>
              <span
                className={`flex items-center gap-1.5 font-display text-lg font-bold ${
                  netPositive ? "text-green-700" : "text-red-600"
                }`}
              >
                {netPositive ? (
                  <TrendingUp className="h-4 w-4" aria-hidden />
                ) : (
                  <TrendingDown className="h-4 w-4" aria-hidden />
                )}
                {formatCurrency(metrics.netCashBalance)}
              </span>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <CompactMetricCard label="Purchases" value={formatCurrency(metrics.totalPurchases)} icon={Wallet} />
            <CompactMetricCard label="Orders" value={String(metrics.totalOrders)} icon={ShoppingBag} />
            <CompactMetricCard label="Avg order" value={formatCurrency(metrics.averageOrderValue)} icon={Calculator} />
          </div>

          <Card>
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Cake vs Brownie Revenue</p>
            <div className="mb-2 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cocoa-600">
                <span className="h-2 w-2 rounded-full bg-berry-500" />
                Cake {formatCurrency(metrics.cakeSales)} · {cakePct}%
              </span>
              <span className="flex items-center gap-1.5 text-cocoa-600">
                <span className="h-2 w-2 rounded-full bg-cocoa-500" />
                Brownie {formatCurrency(metrics.brownieSales)} · {browniePct}%
              </span>
            </div>
            <CategoryChart cakeRevenue={metrics.cakeSales} brownieRevenue={metrics.brownieSales} />
          </Card>

          <Card>
            <p className="mb-1 text-sm font-semibold text-cocoa-600">Sales vs Purchases</p>
            {trendData.length === 0 ? (
              <p className="py-6 text-center text-sm text-cocoa-400">No data for this period yet.</p>
            ) : (
              <TrendChart data={trendData} />
            )}
          </Card>

          {visibleReminders.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-cocoa-600">
                  <BellRing className="h-4 w-4 text-berry-500" aria-hidden />
                  Reminders
                </p>
                {reminders.length > 0 && (
                  <Link to="/more/reminders" className="flex items-center text-sm font-medium text-berry-500">
                    View all
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {visibleReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.orderId}
                    reminder={reminder}
                    compact
                    onDismiss={() => dismissReminder(reminder.orderId, Number(reminder.nextOccurrence.slice(0, 4)))}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <FilterBottomSheet
        open={filterOpen}
        title="Date range"
        onClose={() => setFilterOpen(false)}
        onApply={applyFilter}
        onReset={resetFilter}
        resetLabel="Reset"
      >
        <DateRangeFilter
          preset={draftPreset}
          onPresetChange={setDraftPreset}
          customStart={draftCustomStart}
          customEnd={draftCustomEnd}
          onCustomStartChange={setDraftCustomStart}
          onCustomEndChange={setDraftCustomEnd}
        />
      </FilterBottomSheet>
    </div>
  );
}
