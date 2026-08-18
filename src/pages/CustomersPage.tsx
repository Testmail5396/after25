import { useMemo, useState } from "react";
import { Search, Users, Trophy, Repeat, ChevronRight } from "lucide-react";
import { useData } from "../context/DataContext";
import { aggregateCustomers, getMostFrequentCustomer, getTopSpender } from "../lib/customers";
import { normalizePhoneNumber } from "../lib/phone";
import { formatCurrency, formatDateDisplay } from "../lib/format";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";
import { MobilePageHeader } from "../components/layout/MobilePageHeader";
import { CompactMetricCard } from "../components/dashboard/CompactMetricCard";
import { BottomActionDock } from "../components/ui/BottomActionDock";
import { SidePanel } from "../components/ui/SidePanel";
import { CustomerDetailContent } from "../components/customers/CustomerDetailContent";
import { PAGE_BOTTOM_PADDING_DOCK } from "../components/layout/layoutTokens";

type CustomerSort = "recent" | "alphabetical";

export function CustomersPage() {
  const { orders, loading } = useData();
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<CustomerSort>("recent");

  const customers = useMemo(() => aggregateCustomers(orders), [orders]);
  const topSpender = useMemo(() => getTopSpender(customers), [customers]);
  const mostFrequent = useMemo(() => getMostFrequentCustomer(customers), [customers]);
  const selectedCustomer = useMemo(() => customers.find((c) => c.key === selectedKey), [customers, selectedKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const phoneDigits = normalizePhoneNumber(search);
    return customers
      .filter((c) => {
        if (!query) return true;
        return c.name.toLowerCase().includes(query) || (phoneDigits.length >= 3 && c.key.includes(phoneDigits));
      })
      .sort((a, b) =>
        sortMode === "alphabetical" ? a.name.localeCompare(b.name) : a.lastOrderDate < b.lastOrderDate ? 1 : -1,
      );
  }, [customers, search, sortMode]);

  return (
    <div className={`flex flex-col gap-3 ${PAGE_BOTTOM_PADDING_DOCK}`}>
      <MobilePageHeader title="Customers" meta={`${customers.length} customer${customers.length === 1 ? "" : "s"}`} />

      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name or phone"
          aria-label="Search customers"
          className="h-11 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Once you record a sale, the customer will show up here automatically."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <CompactMetricCard label="Unique customers" value={String(customers.length)} icon={Users} />
            <CompactMetricCard
              label={topSpender ? formatCurrency(topSpender.totalSpent) : "—"}
              value={topSpender?.name ?? "—"}
              icon={Trophy}
              onClick={topSpender ? () => setSelectedKey(topSpender.key) : undefined}
            />
            <CompactMetricCard
              label={mostFrequent ? `${mostFrequent.orderCount} order${mostFrequent.orderCount === 1 ? "" : "s"}` : "—"}
              value={mostFrequent?.name ?? "—"}
              icon={Repeat}
              onClick={mostFrequent ? () => setSelectedKey(mostFrequent.key) : undefined}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-cocoa-400">Sort:</span>
            {(["recent", "alphabetical"] as CustomerSort[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                aria-pressed={sortMode === mode}
                className={`h-8 rounded-full px-3 text-xs font-semibold ${
                  sortMode === mode ? "bg-berry-500 text-white" : "border border-cream-300 bg-white text-cocoa-500"
                }`}
              >
                {mode === "recent" ? "Recent" : "A–Z"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No customers found" description="Try a different name or phone number." />
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((customer) => (
                <button
                  key={customer.key}
                  type="button"
                  onClick={() => setSelectedKey(customer.key)}
                  className="flex items-center gap-2 rounded-xl2 bg-white p-3 text-left shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa-700">{customer.name}</p>
                    <p className="truncate text-xs text-cocoa-500">
                      {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} · Last:{" "}
                      {formatDateDisplay(customer.lastOrderDate)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-cocoa-700">{formatCurrency(customer.totalSpent)}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-cocoa-300" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <BottomActionDock>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone"
            aria-label="Search customers"
            className="h-11 w-full rounded-full border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
          />
        </div>
      </BottomActionDock>

      <SidePanel open={!!selectedKey} title={selectedCustomer?.name ?? "Customer"} onClose={() => setSelectedKey(null)}>
        {selectedKey && <CustomerDetailContent phoneKey={selectedKey} />}
      </SidePanel>
    </div>
  );
}
