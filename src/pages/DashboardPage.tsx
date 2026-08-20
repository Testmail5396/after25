import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addMonths, format } from "date-fns";
import {
  Wallet,
  ShoppingBag,
  Calculator,
  ChevronRight,
  BellRing,
  Calendar,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import type { DateRangePreset } from "@shared/types";
import { useData } from "../context/DataContext";
import { buildDashboardMetrics, sumSales } from "../lib/calculations";
import { buildTrendData } from "../lib/trend";
import { buildReminders } from "../lib/occasion";
import { filterByDateRange, getPresetRange, todayDateOnly } from "../lib/dateRange";
import { formatCurrency, formatDateDisplayShort } from "../lib/format";
import { MobilePageHeader } from "../components/layout/MobilePageHeader";
import { FilterBottomSheet } from "../components/ui/FilterBottomSheet";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { CompactMetricCard } from "../components/dashboard/CompactMetricCard";
import { TrendChart } from "../components/dashboard/TrendChart";
import { ProfitChart } from "../components/dashboard/ProfitChart";
import { MonthlyEventsCard } from "../components/dashboard/MonthlyEventsCard";
import { buildMonthlyEvents } from "../lib/monthlyEvents";
import { CategoryBreakdownChart } from "../components/insights/CategoryBreakdownChart";
import { WeekdayPatternChart } from "../components/insights/WeekdayPatternChart";
import { BestSellersList } from "../components/insights/BestSellersList";
import { buildCategoryBreakdown, buildProductBreakdown, buildWeekdayPattern } from "../lib/insights";
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

  const [trendView, setTrendView] = useState<"trend" | "profit">("trend");

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
  const categoryBreakdown = useMemo(() => buildCategoryBreakdown(filteredOrders), [filteredOrders]);
  const weekdayPattern = useMemo(() => buildWeekdayPattern(filteredOrders), [filteredOrders]);
  const productBreakdown = useMemo(() => buildProductBreakdown(filteredOrders), [filteredOrders]);
  const monthlyEvents = useMemo(() => buildMonthlyEvents(orders), [orders]);
  const monthRangeLabel = useMemo(() => {
    const today = new Date();
    return `${format(today, "MMMM")} & ${format(addMonths(today, 1), "MMMM")}`;
  }, []);
  const pendingOrders = useMemo(() => orders.filter((o) => (o.paymentStatus ?? "Paid") === "Pending"), [orders]);
  const pendingTotal = useMemo(() => sumSales(pendingOrders), [pendingOrders]);

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
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-4">
          <Card className="flex flex-col gap-3 lg:col-start-1">
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

          <div className="grid grid-cols-3 gap-2 lg:col-start-1">
            <CompactMetricCard label="Purchases" value={formatCurrency(metrics.totalPurchases)} icon={Wallet} />
            <CompactMetricCard label="Orders" value={String(metrics.totalOrders)} icon={ShoppingBag} />
            <CompactMetricCard label="Avg order" value={formatCurrency(metrics.averageOrderValue)} icon={Calculator} />
          </div>

          {pendingTotal > 0 && (
            <Card className="lg:col-start-1">
              <Link to="/sales?payment=Pending" className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs text-cocoa-400">
                      Pending payments · {pendingOrders.length} sale{pendingOrders.length === 1 ? "" : "s"}
                    </p>
                    <p className="font-display text-lg font-bold text-red-600">{formatCurrency(pendingTotal)}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-cocoa-300" aria-hidden />
              </Link>
            </Card>
          )}

          {monthlyEvents.length > 0 && (
            <Card className="lg:col-start-2 lg:row-start-1">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-cocoa-600">
                <CalendarClock className="h-4 w-4 text-berry-500" aria-hidden />
                Coming up in {monthRangeLabel}
              </p>
              <MonthlyEventsCard events={monthlyEvents} monthLabel={monthRangeLabel} />
            </Card>
          )}

          <Card className="lg:col-start-1">
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Category vs Amount</p>
            <CategoryBreakdownChart items={categoryBreakdown} />
          </Card>

          <Card className="lg:col-start-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-cocoa-600">
                {trendView === "trend" ? "Sales vs Purchases" : "Actual Profit"}
              </p>
              <div className="flex rounded-full border border-cream-300 bg-cream-100 p-0.5">
                {(["trend", "profit"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setTrendView(view)}
                    aria-pressed={trendView === view}
                    className={`h-7 rounded-full px-3 text-xs font-semibold ${
                      trendView === view ? "bg-white text-berry-600 shadow-sm" : "text-cocoa-500"
                    }`}
                  >
                    {view === "trend" ? "Trend" : "Profit"}
                  </button>
                ))}
              </div>
            </div>
            {trendData.length === 0 ? (
              <p className="py-6 text-center text-sm text-cocoa-400">No data for this period yet.</p>
            ) : trendView === "trend" ? (
              <TrendChart data={trendData} />
            ) : (
              <ProfitChart data={trendData} />
            )}
          </Card>

          <Card className="lg:col-start-1">
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Orders by day of week</p>
            <WeekdayPatternChart pattern={weekdayPattern} />
          </Card>

          <Card className="lg:col-start-1">
            <p className="mb-3 text-sm font-semibold text-cocoa-600">Best sellers</p>
            <BestSellersList items={productBreakdown} />
          </Card>

          {visibleReminders.length > 0 && (
            <div className="lg:col-start-1">
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
        </div>
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
