import type { ProductBreakdownItem } from "../../lib/insights";
import { formatCurrency } from "../../lib/format";

interface ProductBreakdownListProps {
  items: ProductBreakdownItem[];
}

/** Ranked list of products by revenue — answers "what's actually selling". */
export function ProductBreakdownList({ items }: ProductBreakdownListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-cocoa-400">No sales for this selection yet.</p>;
  }

  const maxRevenue = items[0]?.revenue ?? 1;

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <div key={`${item.productName}-${item.quantityUnit}`} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-medium text-cocoa-700">
              {index + 1}. {item.productName}
              <span className="ml-1.5 text-xs font-normal text-cocoa-400">({item.category})</span>
            </span>
            <span className="shrink-0 font-semibold text-cocoa-700">{formatCurrency(item.revenue)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-berry-500"
              style={{ width: `${Math.max((item.revenue / maxRevenue) * 100, 3)}%` }}
            />
          </div>
          <p className="text-xs text-cocoa-400">
            {item.quantitySold} {item.quantityUnit} sold · {item.orderCount} order{item.orderCount === 1 ? "" : "s"}
          </p>
        </div>
      ))}
    </div>
  );
}
