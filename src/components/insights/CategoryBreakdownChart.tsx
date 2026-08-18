import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

/** Revenue by product category — supports any number of categories, not just Cake/Brownie. */
export function CategoryBreakdownChart({ items }: CategoryBreakdownChartProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-cocoa-400">No sales for this selection yet.</p>;
  }

  const chartHeight = Math.max(items.length * 40, 80);

  return (
    <div style={{ height: chartHeight }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F0E0CE" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#7A5240" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={78}
            tick={{ fontSize: 11, fill: "#4A2E23" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, _name, entry) => [
              `${formatCurrency(value)} · ${entry.payload.orderCount} order${entry.payload.orderCount === 1 ? "" : "s"}`,
              "Revenue",
            ]}
            contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
          />
          <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={22}>
            {items.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
