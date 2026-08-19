import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ProductCategory } from "@shared/types";
import type { CategoryBreakdownItem } from "../../lib/insights";
import { formatCurrency } from "../../lib/format";

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Cake: "#8A2E4F",
  Brownie: "#5C3A2C",
  Cupcake: "#A8446A",
  Biscuits: "#7A5240",
  "Bento Cake": "#DE97A0",
};

interface CategoryBreakdownChartProps {
  items: CategoryBreakdownItem[];
}

/** Revenue by product category as a donut chart, with the top-selling category called out at the center. */
export function CategoryBreakdownChart({ items }: CategoryBreakdownChartProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-cocoa-400">No sales for this selection yet.</p>;
  }

  const top = items[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="revenue"
              nameKey="category"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={items.length > 1 ? 2 : 0}
              stroke="none"
            >
              {items.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, entry) => [
                `${formatCurrency(value)} · ${entry.payload.orderCount} order${entry.payload.orderCount === 1 ? "" : "s"}`,
                entry.payload.category,
              ]}
              contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-cocoa-400">Top category</p>
          <p className="font-display text-lg font-bold leading-tight text-cocoa-700">{top.category}</p>
          <p className="text-xs text-cocoa-500">{Math.round(top.percentage)}% of sales</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
              aria-hidden
            />
            <span className="flex-1 truncate text-sm text-cocoa-600">{item.category}</span>
            <span className="text-xs font-semibold text-cocoa-700">{formatCurrency(item.revenue)}</span>
            <span className="w-10 shrink-0 text-right text-xs text-cocoa-400">{Math.round(item.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
