import { useMemo, useState } from "react";
import { Search, Tag } from "lucide-react";
import type { ProductRateRecord } from "@shared/types";
import { useCloseOnBack } from "../../lib/useCloseOnBack";
import { formatCurrency } from "../../lib/format";

interface ProductRatePickerSheetProps {
  open: boolean;
  products: ProductRateRecord[];
  onSelect: (product: ProductRateRecord) => void;
  onClose: () => void;
}

/** Bottom sheet for picking a product from the price list to prefill category and rate. */
export function ProductRatePickerSheet({ open, products, onSelect, onClose }: ProductRatePickerSheetProps) {
  const [search, setSearch] = useState("");
  useCloseOnBack(open, onClose);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((p) => !query || p.productName.toLowerCase().includes(query))
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [products, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-cocoa-800/40 sm:items-center">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl bg-cream-100 pb-[env(safe-area-inset-bottom)] sm:mb-6 sm:rounded-2xl sm:shadow-soft">
        <div className="border-b border-cream-300 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-cocoa-700">Choose a product</h2>
            <button type="button" onClick={onClose} className="text-sm font-medium text-cocoa-500">
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
              placeholder="Search products"
              aria-label="Search products"
              className="h-11 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {products.length === 0 ? (
            <p className="py-6 text-center text-sm text-cocoa-400">
              No products in your price list yet. Add one from More &gt; Product Rates.
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-cocoa-400">No matches. Type the product name directly instead.</p>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product)}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 text-left shadow-card"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
                    <Tag className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cocoa-700">{product.productName}</p>
                    <p className="truncate text-xs text-cocoa-500">
                      {product.category} · {formatCurrency(product.rate)}/{product.rateUnit === "pcs" ? "pc" : "kg"}
                    </p>
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
