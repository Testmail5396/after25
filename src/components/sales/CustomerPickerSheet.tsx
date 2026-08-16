import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import type { CustomerSummary } from "@shared/types";
import { useCloseOnBack } from "../../lib/useCloseOnBack";
import { normalizePhoneNumber } from "../../lib/phone";

interface CustomerPickerSheetProps {
  open: boolean;
  customers: CustomerSummary[];
  onSelect: (customer: CustomerSummary) => void;
  onClose: () => void;
}

/** Bottom sheet for picking an existing customer (from past sales) to prefill name + phone. */
export function CustomerPickerSheet({ open, customers, onSelect, onClose }: CustomerPickerSheetProps) {
  const [search, setSearch] = useState("");
  useCloseOnBack(open, onClose);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const phoneDigits = normalizePhoneNumber(search);
    return customers
      .filter((c) => {
        if (!query) return true;
        return c.name.toLowerCase().includes(query) || (phoneDigits.length >= 3 && c.key.includes(phoneDigits));
      })
      .sort((a, b) => (a.lastOrderDate < b.lastOrderDate ? 1 : -1));
  }, [customers, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-cocoa-800/40 sm:items-center">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl bg-cream-100 pb-[env(safe-area-inset-bottom)] sm:mb-6 sm:rounded-2xl sm:shadow-soft">
        <div className="border-b border-cream-300 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-cocoa-700">Choose a customer</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-cocoa-500"
            >
              Cancel
            </button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden />
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone"
              aria-label="Search customers"
              className="h-11 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {customers.length === 0 ? (
            <p className="py-6 text-center text-sm text-cocoa-400">No previous customers yet.</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-cocoa-400">No matches. Type the new customer&apos;s details instead.</p>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              {filtered.map((customer) => (
                <button
                  key={customer.key}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 text-left shadow-card"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
                    <User className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa-700">{customer.name}</p>
                    <p className="truncate text-xs text-cocoa-500">{customer.phoneNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
