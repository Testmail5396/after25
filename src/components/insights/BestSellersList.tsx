import type { ProductBreakdownItem } from "../../lib/insights";
import { formatCurrency } from "../../lib/format";

interface BestSellersListProps {
  items: ProductBreakdownItem[];
  limit?: number;
}

/** Ranked list of top-selling products by revenue — helps spot what to stock up on. */
export function BestSellersList({ items, limit = 5 }: BestSellersListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-cocoa-400">No sales for this selection yet.</p>;
  }

  const top = items.slice(0, limit);
  const maxRevenue = top[0].revenue;

  return (
    <div className="flex flex-col gap-3">
      {top.map((item, index) => (
        <div key={`${item.productName}-${item.quantityUnit}`} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-xs font-bold text-berry-600">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-cocoa-700">{item.productName}</p>
              <p className="shrink-0 text-sm font-semibold text-cocoa-700">{formatCurrency(item.revenue)}</p>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-berry-400"
                style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-cocoa-400">
              {item.quantitySold} {item.quantityUnit} · {item.orderCount} order{item.orderCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
