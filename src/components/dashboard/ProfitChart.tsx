import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@shared/types";
import { formatCurrency } from "../../lib/format";

interface ProfitPoint extends TrendPoint {
  profit: number;
}

interface ProfitChartProps {
  data: TrendPoint[];
}

/** Actual profit (sales − purchases) per bucket — not just a single total, but where the profit/loss happened. */
export function ProfitChart({ data }: ProfitChartProps) {
  const profitData: ProfitPoint[] = data.map((point) => ({ ...point, profit: point.sales - point.purchases }));
  const tickInterval = profitData.length > 8 ? Math.ceil(profitData.length / 6) : 0;
  const totalProfit = profitData.reduce((sum, p) => sum + p.profit, 0);

  return (
    <div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={profitData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F0E0CE" vertical={false} />
            <XAxis
              dataKey="label"
              interval={tickInterval}
              tick={{ fontSize: 10, fill: "#7A5240" }}
              axisLine={{ stroke: "#F0E0CE" }}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#7A5240" }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(value: number) => (Math.abs(value) >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Profit"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
            />
            <Bar dataKey="profit" radius={[4, 4, 4, 4]}>
              {profitData.map((point) => (
                <Cell key={point.bucketStart} fill={point.profit >= 0 ? "#2F7D5A" : "#C0392B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-xs text-cocoa-500">
        Total profit for this period:{" "}
        <span className={`font-semibold ${totalProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
          {formatCurrency(totalProfit)}
        </span>
      </p>
    </div>
  );
}
