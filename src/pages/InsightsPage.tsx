import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import type { DateRangePreset } from "@shared/types";
import { useData } from "../context/DataContext";
import { filterByDateRange, getPresetRange, todayDateOnly } from "../lib/dateRange";
import { formatCurrency, formatDateDisplayShort } from "../lib/format";
import { sumSales } from "../lib/calculations";
import { aggregateCustomers } from "../lib/customers";
import { normalizePhoneNumber } from "../lib/phone";
import { buildCategoryBreakdown, buildProductBreakdown, buildWeekdayPattern } from "../lib/insights";
import { MobilePageHeader } from "../components/layout/MobilePageHeader";
import { FilterBottomSheet } from "../components/ui/FilterBottomSheet";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { CategoryBreakdownChart } from "../components/insights/CategoryBreakdownChart";
import { WeekdayPatternChart } from "../components/insights/WeekdayPatternChart";
import { ProductBreakdownList } from "../components/insights/ProductBreakdownList";
import { Card } from "../components/ui/Card";
import { CardSkeleton } from "../components/ui/Skeleton";

const RANGE_LABELS: Record<DateRangePreset, string> = {
  last7days: "Last 7 days",
  thisMonth: "This month",
  last6months: "Last 6 months",
  last1year: "Last 1 year",
  custom: "Custom range",
};

const NO_FILTER = "";

export function InsightsPage() {
  const { orders, loading } = useData();

  const [preset, setPreset] = useState<DateRangePreset>("last1year");
  const [customStart, setCustomStart] = useState(todayDateOnly());
  const [customEnd, setCustomEnd] = useState(todayDateOnly());
  const [customerKey, setCustomerKey] = useState(NO_FILTER);
  const [productName, setProductName] = useState(NO_FILTER);

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState(preset);
  const [draftCustomStart, setDraftCustomStart] = useState(customStart);
  const [draftCustomEnd, setDraftCustomEnd] = useState(customEnd);
  const [draftCustomerKey, setDraftCustomerKey] = useState(customerKey);
  const [draftProductName, setDraftProductName] = useState(productName);

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd };
    return getPresetRange(preset);
  }, [preset, customStart, customEnd]);

  const rangeLabel =
    preset === "custom" ? `${formatDateDisplayShort(customStart)} – ${formatDateDisplayShort(customEnd)}` : RANGE_LABELS[preset];

  const allCustomers = useMemo(() => aggregateCustomers(orders).sort((a, b) => a.name.localeCompare(b.name)), [orders]);
  const allProductNames = useMemo(() => {
    const names = new Set<string>();
    orders.forEach((o) => names.add(o.productName.trim()));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const activeFilterCount = (customerKey ? 1 : 0) + (productName ? 1 : 0);

  const filteredOrders = useMemo(() => {
    let result = filterByDateRange(orders, range, (o) => o.saleDate);
    if (customerKey) {
      result = result.filter((o) => (normalizePhoneNumber(o.phoneNumber) || o.phoneNumber) === customerKey);
    }
    if (productName) {
      result = result.filter((o) => o.productName.trim().toLowerCase() === productName.toLowerCase());
    }
    return result;
  }, [orders, range, customerKey, productName]);

  const categoryBreakdown = useMemo(() => buildCategoryBreakdown(filteredOrders), [filteredOrders]);
  const weekdayPattern = useMemo(() => buildWeekdayPattern(filteredOrders), [filteredOrders]);
  const productBreakdown = useMemo(() => buildProductBreakdown(filteredOrders), [filteredOrders]);
  const totalRevenue = useMemo(() => sumSales(filteredOrders), [filteredOrders]);

  function openFilter() {
    setDraftPreset(preset);
    setDraftCustomStart(customStart);
    setDraftCustomEnd(customEnd);
    setDraftCustomerKey(customerKey);
    setDraftProductName(productName);
    setFilterOpen(true);
  }

  function applyFilter() {
    setPreset(draftPreset);
    setCustomStart(draftCustomStart);
    setCustomEnd(draftCustomEnd);
    setCustomerKey(draftCustomerKey);
    setProductName(draftProductName);
    setFilterOpen(false);
  }

  function clearFilter() {
    setDraftPreset("last1year");
    setDraftCustomerKey(NO_FILTER);
    setDraftProductName(NO_FILTER);
    setPreset("last1year");
    setCustomerKey(NO_FILTER);
    setProductName(NO_FILTER);
    setFilterOpen(false);
  }

  return (
    <div className="flex flex-col gap-3.5">
      <Link to="/more" className="flex items-center gap-1 text-sm font-medium text-cocoa-500">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to more
      </Link>

      <MobilePageHeader
        title="Insights"
        meta={`${rangeLabel}${activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"}` : ""}`}
        action={
          <button
            type="button"
            onClick={openFilter}
            aria-label="Filter insights"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white text-cocoa-500"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {activeFilterCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-berry-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          <Card className="flex items-center justify-between">
            <span className="text-sm text-cocoa-500">Total revenue for this selection</span>
            <span className="text-lg font-bold text-cocoa-700">{formatCurrency(totalRevenue)}</span>
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Category vs Amount</p>
            <CategoryBreakdownChart items={categoryBreakdown} />
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-cocoa-600">Orders by day of week</p>
            <WeekdayPatternChart pattern={weekdayPattern} />
          </Card>

          <Card>
            <p className="mb-3 text-sm font-semibold text-cocoa-600">Top products</p>
            <ProductBreakdownList items={productBreakdown} />
          </Card>
        </>
      )}

      <FilterBottomSheet
        open={filterOpen}
        title="Filter insights"
        onClose={() => setFilterOpen(false)}
        onApply={applyFilter}
        onReset={clearFilter}
        resetLabel="Clear"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-cocoa-600">Date range</p>
            <DateRangeFilter
              preset={draftPreset}
              onPresetChange={setDraftPreset}
              customStart={draftCustomStart}
              customEnd={draftCustomEnd}
              onCustomStartChange={setDraftCustomStart}
              onCustomEndChange={setDraftCustomEnd}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa-600">
            Customer
            <select
              value={draftCustomerKey}
              onChange={(e) => setDraftCustomerKey(e.target.value)}
              className="h-11 rounded-xl border border-cream-300 bg-white px-3 text-sm text-cocoa-700"
            >
              <option value="">All customers</option>
              {allCustomers.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa-600">
            Product
            <select
              value={draftProductName}
              onChange={(e) => setDraftProductName(e.target.value)}
              className="h-11 rounded-xl border border-cream-300 bg-white px-3 text-sm text-cocoa-700"
            >
              <option value="">All products</option>
              {allProductNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </FilterBottomSheet>
    </div>
  );
}
