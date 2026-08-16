import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Trophy, Repeat } from "lucide-react";
import { useData } from "../context/DataContext";
import { aggregateCustomers, getMostFrequentCustomer, getTopSpender } from "../lib/customers";
import { normalizePhoneNumber } from "../lib/phone";
import { formatCurrency, formatDateDisplay } from "../lib/format";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";

export function CustomersPage() {
  const { orders, loading } = useData();
  const [search, setSearch] = useState("");

  const customers = useMemo(() => aggregateCustomers(orders), [orders]);
  const topSpender = useMemo(() => getTopSpender(customers), [customers]);
  const mostFrequent = useMemo(() => getMostFrequentCustomer(customers), [customers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const phoneDigits = normalizePhoneNumber(search);
    return customers
      .filter((c) => {
        if (!query) return true;
        return c.name.toLowerCase().includes(query) || (phoneDigits.length >= 3 && c.key.includes(phoneDigits));
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Customers</h1>
        <p className="text-sm text-cocoa-500">Built automatically from your sales records.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-berry-500">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-cocoa-400">Unique customers</p>
                <p className="font-display text-lg font-bold text-cocoa-700">{customers.length}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-berry-500">
                <Trophy className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-cocoa-400">Top spender</p>
                <p className="truncate font-display text-lg font-bold text-cocoa-700">{topSpender?.name ?? "—"}</p>
                {topSpender && <p className="text-xs text-cocoa-500">{formatCurrency(topSpender.totalSpent)}</p>}
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-berry-500">
                <Repeat className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-cocoa-400">Most orders</p>
                <p className="truncate font-display text-lg font-bold text-cocoa-700">{mostFrequent?.name ?? "—"}</p>
                {mostFrequent && <p className="text-xs text-cocoa-500">{mostFrequent.orderCount} orders</p>}
              </div>
            </Card>
          </div>

          <div className="relative">
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

          <div className="flex flex-col gap-3">
            {filtered.map((customer) => (
              <Link
                key={customer.key}
                to={`/customers/${customer.key}`}
                className="flex items-center justify-between rounded-xl2 bg-white p-4 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cocoa-700">{customer.name}</p>
                  <p className="text-sm text-cocoa-500">
                    {customer.orderCount} orders · Last: {formatDateDisplay(customer.lastOrderDate)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-cocoa-700">{formatCurrency(customer.totalSpent)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
