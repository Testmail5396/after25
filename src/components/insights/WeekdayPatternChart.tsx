import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekdayPattern } from "../../lib/insights";
import { formatCurrency } from "../../lib/format";

interface WeekdayPatternChartProps {
  pattern: WeekdayPattern[];
}

/** How many orders land on each day of the week — helps spot the busiest days. */
export function WeekdayPatternChart({ pattern }: WeekdayPatternChartProps) {
  const hasData = pattern.some((p) => p.orderCount > 0);
  if (!hasData) {
    return <p className="py-6 text-center text-sm text-cocoa-400">No orders for this selection yet.</p>;
  }

  const busiest = pattern.reduce((top, p) => (p.orderCount > top.orderCount ? p : top));

  return (
    <div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pattern} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F0E0CE" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A5240" }} axisLine={{ stroke: "#F0E0CE" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#7A5240" }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
            <Tooltip
              formatter={(value: number, _name, entry) => [`${value} order${value === 1 ? "" : "s"} · ${formatCurrency(entry.payload.revenue)}`, "Orders"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
            />
            <Bar dataKey="orderCount" radius={[6, 6, 0, 0]} fill="#8A2E4F" barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {busiest.orderCount > 0 && (
        <p className="mt-1 text-center text-xs text-cocoa-500">
          Busiest day: <span className="font-semibold text-cocoa-700">{busiest.day}</span> ({busiest.orderCount} order
          {busiest.orderCount === 1 ? "" : "s"})
        </p>
      )}
    </div>
  );
}
